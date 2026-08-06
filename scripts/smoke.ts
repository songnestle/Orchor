/**
 * 全站冒烟测试:遍历每个路由,点击每个可点元素,收集
 * console 报错 / 未捕获异常 / 失败请求 / 点击后页面崩溃。
 *
 * 用系统 Chrome(puppeteer-core),无钱包环境 —— 钱包类操作
 * 的预期是"优雅降级"(弹连接框或提示),任何未捕获异常都算失败。
 *
 *   BASE_URL=http://localhost:3100 npx tsx scripts/smoke.ts
 *   BASE_URL=https://orchor.webpsy.net npx tsx scripts/smoke.ts
 */
import puppeteer, { type Browser, type Page } from "puppeteer-core";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ROUTES = [
  "/", "/rankings", "/deck",
  "/creator", "/history", "/transactions", "/battle", "/create",
  "/profile/atlaslabs",
];

/**
 * 已合并进首页的旧路径。只验证它们仍然可达并落到 /,不做点击遍历 ——
 * 遍历时脚本每轮发现 pathname 不等于目标就会 goto 回去,而这里每次
 * goto 都被重定向,页面反复卸载,wagmi 会在卸载中抛 ConnectorNotConnected。
 * 那是测试与重定向打架,不是产品问题。
 */
const REDIRECTS: Array<[from: string, to: string]> = [
  ["/explore", "/"],
  ["/marketplace", "/"],
];

interface RouteReport {
  route: string;
  status: number | null;
  clicked: number;
  skippedExternal: number;
  consoleErrors: string[];
  pageErrors: string[];
  badResponses: string[];
  clickFailures: string[];
}

/** 这些报错与钱包扩展缺失/第三方 SDK 噪音相关,记录但不算失败。 */
const NOISE = [
  /walletconnect/i, /web3modal/i, /Failed to fetch remote project configuration/i,
  /coinbase/i, /pulse\.walletconnect/i, /favicon/i, /net::ERR_/i,
  // 资源加载类 console 消息不带 URL,无法归因;响应监听已按 URL 精确记录 4xx/5xx。
  /Failed to load resource/i,
];
const isNoise = (s: string) => NOISE.some((re) => re.test(s));

/** 未登录环境下这些 4xx 是设计行为(签名会话鉴权),不算失败。 */
const EXPECTED_401 = [/\/api\/auth\/me$/, /\/api\/credits\//, /\/api\/deposits/, /\/api\/skills\/runs/, /\/api\/creator\//];
const isExpectedAuth = (url: string, status: number) =>
  (status === 401 || status === 403) && EXPECTED_401.some((re) => re.test(new URL(url).pathname));

async function auditRoute(browser: Browser, route: string): Promise<RouteReport> {
  const page: Page = await browser.newPage();
  const rep: RouteReport = {
    route, status: null, clicked: 0, skippedExternal: 0,
    consoleErrors: [], pageErrors: [], badResponses: [], clickFailures: [],
  };

  page.on("console", (m) => {
    if (m.type() === "error" && !isNoise(m.text())) rep.consoleErrors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) => rep.pageErrors.push(String(e).slice(0, 200)));
  page.on("response", (r) => {
    if (
      r.status() >= 400 && r.url().startsWith(BASE) &&
      !isNoise(r.url()) && !isExpectedAuth(r.url(), r.status())
    ) {
      rep.badResponses.push(`${r.status()} ${r.url().slice(BASE.length, BASE.length + 80)}`);
    }
  });

  // networkidle 在这个应用上等不到:钱包 SDK 会在后台持续重试第三方端点,
  // goto 超时竞态还会引发 "detached frame"。domcontentloaded + 固定沉降更稳。
  const resp = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 45_000 });
  rep.status = resp?.status() ?? null;
  await new Promise((r) => setTimeout(r, 2500));

  // 点击遍历:每轮重新枚举,点过的(按文本+序号指纹)跳过。
  // 每轮开头先纠偏:上一轮点击若触发慢导航(>沉降时间),枚举会撞上
  // 正在导航的 frame 抛 detached —— 所以纠偏与枚举都要容错重试。
  const seen = new Set<string>();
  for (let round = 0; round < 60; round++) {
    let targets: Array<{ i: number; txt: string; external: boolean; newTab: boolean; visible: boolean; disabled: boolean }>;
    try {
      if (new URL(page.url()).pathname !== route) {
        await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await new Promise((r) => setTimeout(r, 800));
      }
      targets = await page.$$eval(
        "button, [role=button], a[href]",
        (els, base) =>
          els.map((el, i) => {
            const a = el as HTMLAnchorElement;
            const href = a.href || "";
            const external = !!href && !href.startsWith(base as string);
            const newTab = a.target === "_blank";
            const txt = (el.textContent || "").trim().slice(0, 40);
            const visible = !!(el as HTMLElement).offsetParent;
            return { i, txt, external, newTab, visible, disabled: (el as HTMLButtonElement).disabled === true };
          }),
        BASE
      );
    } catch {
      // 导航竞态(detached frame 等):稳一拍,回到被测路由重试本轮。
      await new Promise((r) => setTimeout(r, 1000));
      await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));
      continue;
    }
    const next = targets.find(
      (c) => c.visible && !c.disabled && !c.external && !c.newTab && !seen.has(`${c.txt}#${c.i}`)
    );
    if (!next) {
      rep.skippedExternal = targets.filter((c) => c.external || c.newTab).length;
      break;
    }
    seen.add(`${next.txt}#${next.i}`);
    try {
      const handles = await page.$$("button, [role=button], a[href]");
      const h = handles[next.i];
      if (h) {
        // 点击加 3s 竞速超时:触发原生对话框/协议弹窗时 click 可能永不返回。
        await Promise.race([
          h.click({ delay: 10 }).catch(() => {}),
          new Promise((r) => setTimeout(r, 3000)),
        ]);
        rep.clicked++;
        await new Promise((r) => setTimeout(r, 350));
        // 关掉可能弹出的 modal / 恢复路由
        await page.keyboard.press("Escape").catch(() => {});
        // pathname 精确比较:startsWith 对 route="/" 恒真,首页点走后会漂到别的页
        if (new URL(page.url()).pathname !== route) {
          await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 30_000 });
          await new Promise((r) => setTimeout(r, 600));
        }
        // 页面还活着?
        const alive = await page.evaluate(() => document.body.children.length > 0).catch(() => false);
        if (!alive) rep.clickFailures.push(`page died after clicking "${next.txt}"`);
      }
    } catch (e: any) {
      rep.clickFailures.push(`"${next.txt}": ${String(e.message).slice(0, 120)}`);
    }
  }

  await page.close();
  return rep;
}

/** 旧路径是否仍可达并落到新位置 */
async function checkRedirects(): Promise<string[]> {
  const bad: string[] = [];
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-gpu"],
  });
  try {
    for (const [from, to] of REDIRECTS) {
      const page = await browser.newPage();
      try {
        await page.goto(BASE + from, { waitUntil: "domcontentloaded", timeout: 30_000 });
        const landed = new URL(page.url()).pathname;
        if (landed !== to) bad.push(`${from} -> ${landed} (expected ${to})`);
        else process.stderr.write(`redirect ok: ${from} -> ${to}\n`);
      } catch (e: any) {
        bad.push(`${from}: ${String(e.message).slice(0, 80)}`);
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
  return bad;
}

async function main() {
  const reports: RouteReport[] = [];
  // 每个路由独立浏览器实例:一次崩溃不拖垮整场测试。
  // headless Chrome 紧挨着起停偶发资源竞态把实例弄死("Connection closed"),
  // 与页面无关 —— 所以路由失败先隔 3s 换全新实例重试一次,仍失败才记账。
  for (const route of ROUTES) {
    let report: RouteReport | null = null;
    for (let attempt = 1; attempt <= 2 && !report; attempt++) {
      process.stderr.write(`auditing ${route} (attempt ${attempt}) …\n`);
      let browser: Browser | null = null;
      try {
        browser = await puppeteer.launch({
          executablePath: CHROME,
          headless: true,
          args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,900"],
        });
        report = await auditRoute(browser, route);
      } catch (e: any) {
        if (attempt === 2) {
          report = {
            route, status: null, clicked: 0, skippedExternal: 0,
            consoleErrors: [], pageErrors: [`ROUTE FAILED: ${String(e.message).slice(0, 150)}`],
            badResponses: [], clickFailures: [],
          };
        }
      } finally {
        await browser?.close().catch(() => {});
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    reports.push(report!);
  }

  const redirectProblems = await checkRedirects();

  let failures = redirectProblems.length;
  for (const e of redirectProblems) console.log(`✗ redirect  ${e}`);
  for (const r of reports) {
    const bad = r.pageErrors.length + r.clickFailures.length + r.badResponses.length +
      (r.status && r.status >= 400 ? 1 : 0);
    failures += bad;
    const mark = bad ? "✗" : "✓";
    console.log(`${mark} ${r.route.padEnd(20)} HTTP ${r.status}  clicked=${r.clicked}  ` +
      `consoleErr=${r.consoleErrors.length} pageErr=${r.pageErrors.length} ` +
      `bad=${r.badResponses.length} clickFail=${r.clickFailures.length}`);
    for (const e of r.pageErrors) console.log(`    pageerror: ${e}`);
    for (const e of r.clickFailures) console.log(`    clickfail: ${e}`);
    for (const e of r.badResponses) console.log(`    badresp:   ${e}`);
    for (const e of r.consoleErrors.slice(0, 3)) console.log(`    console:   ${e}`);
  }
  console.log(failures ? `\n${failures} 个问题` : "\n全部通过");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
