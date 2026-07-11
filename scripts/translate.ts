/**
 * Auto-translate helper.
 * 1. Reads a list of English UI strings (from stdin, one per line)
 * 2. Translates each to Simplified Chinese via the fomalhaut proxy
 * 3. Prints a JSON map { "English": "中文" }
 *
 * Usage: cat strings.txt | npx tsx scripts/translate.ts > out.json
 */

const API = "https://fomalhaut.vip/v1/chat/completions";
const KEY = process.env.TRANSLATE_KEY || "";
const MODEL = "claude-sonnet-4-5-20250929";

async function translateBatch(lines: string[]): Promise<Record<string, string>> {
  // Translate in one call: give numbered list, ask for numbered output.
  const numbered = lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
  const prompt = `Translate these UI strings to Simplified Chinese. Keep them concise and natural for a crypto/AI app UI. Return ONLY a numbered list matching the input, one translation per line, no quotes, no extra text.\n\n${numbered}`;

  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";

  const map: Record<string, string> = {};
  const outLines = content.split("\n").map((s) => s.trim()).filter(Boolean);
  for (const outLine of outLines) {
    const m = outLine.match(/^(\d+)[.、)]\s*(.+)$/);
    if (m) {
      const idx = parseInt(m[1], 10) - 1;
      if (lines[idx]) map[lines[idx]] = m[2].trim();
    }
  }
  return map;
}

async function main() {
  const input = await new Promise<string>((resolve) => {
    let buf = "";
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
  });

  const lines = input.split("\n").map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) {
    console.error("No input strings");
    process.exit(1);
  }

  // Batch in chunks of 30 to keep responses reliable.
  const result: Record<string, string> = {};
  for (let i = 0; i < lines.length; i += 30) {
    const chunk = lines.slice(i, i + 30);
    process.stderr.write(`Translating ${i + 1}-${i + chunk.length} / ${lines.length}...\n`);
    const map = await translateBatch(chunk);
    Object.assign(result, map);
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
