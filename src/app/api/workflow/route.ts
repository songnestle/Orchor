import { NextRequest, NextResponse } from "next/server";

interface SkillRef {
  name: string;
  type: string;
}

interface WorkflowReq {
  prompt: string;
  skills: SkillRef[];
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: WorkflowReq;
  try {
    body = (await req.json()) as WorkflowReq;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const prompt = (body.prompt || "").trim();
  const skills = Array.isArray(body.skills) ? body.skills : [];
  if (!prompt || skills.length === 0) {
    return NextResponse.json({ error: "prompt and skills required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(buildMock(prompt, skills));
  }

  try {
    const result = await runWithOpenAI(prompt, skills, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[workflow] OpenAI failed, falling back to mock:", err);
    return NextResponse.json(buildMock(prompt, skills));
  }
}

// ----- OpenAI path -----

const SKILL_SYSTEM_PROMPTS: Record<string, string> = {
  "Research Oracle":
    "You are a Web3 research analyst. Extract 3 sharp insights and angles from the user's task. Output 3 short bullet points, max 240 chars total.",
  "Copywriting Engine":
    "You are a senior marketing copywriter. Turn the prior research insights into one tight piece of persuasive marketing copy. Max 360 chars. Confident, specific, no fluff.",
  "Viral Twitter Agent":
    "You are a crypto-native Twitter ghostwriter. Turn the prior copy into one viral tweet plus a 3-tweet thread. Use crypto Twitter cadence. Mention Monad, AI workflows, agent economy and micropayments where natural. No emojis spam.",
  "Meme Context Adapter":
    "You are a CT meme strategist. Reframe the prior output with CT-native tone and one subtle meme reference. Keep substance. Max 280 chars.",
  "Brand Positioning Agent":
    "You are a Web3 brand strategist. Sharpen positioning for a Web3 audience: who it's for, what it replaces, why it wins. 3 short lines.",
};

function systemFor(name: string, type: string): string {
  return (
    SKILL_SYSTEM_PROMPTS[name] ||
    `You are an AI skill of type "${type}" named "${name}". Improve and transform the prior step output toward the user's goal in under 280 chars.`
  );
}

async function runWithOpenAI(prompt: string, skills: SkillRef[], apiKey: string) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  const steps: Array<{ skill: string; output: string }> = [];
  let prior = `User task: ${prompt}`;

  for (const s of skills) {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        { role: "system", content: systemFor(s.name, s.type) },
        { role: "user", content: prior },
      ],
    });
    const out = completion.choices[0]?.message?.content?.trim() || "";
    steps.push({ skill: s.name, output: out });
    prior = `User task: ${prompt}\n\nPrevious step (${s.name}):\n${out}`;
  }

  const finalOutput = steps[steps.length - 1]?.output ?? "";
  return { steps, finalOutput };
}

// ----- Mock path (high quality, demo-ready) -----

function buildMock(prompt: string, skills: SkillRef[]) {
  const subject = prompt.replace(/\s+/g, " ").trim();
  const steps = skills.map((s) => ({
    skill: s.name,
    output: mockFor(s.name, s.type, subject),
  }));
  const finalOutput =
    steps[steps.length - 1]?.output ?? mockTweet(subject);
  return { steps, finalOutput };
}

function mockFor(name: string, type: string, subject: string): string {
  switch (name) {
    case "Research Oracle":
      return [
        `• Audience: crypto-native builders & AI-curious devs.`,
        `• Hook: "${subject}" — composability + speed are the unlock.`,
        `• Angle: position Monad as the settlement layer for AI workflows.`,
      ].join("\n");
    case "Copywriting Engine":
      return `Stop bolting AI onto chains. Compose it. ${subject} on SkillFlow turns AI capabilities into modular skills you can stack, run and pay for in one click — settled on Monad in milliseconds. The agent economy needs a rail. Monad is it.`;
    case "Viral Twitter Agent":
      return [
        `gm. AI agents don't need another chatbot — they need a settlement layer.`,
        ``,
        `built ${subject || "a skills marketplace"} on @monad_xyz:`,
        `→ pick AI skill modules`,
        `→ compose a workflow`,
        `→ pay once, split onchain`,
        ``,
        `the agent economy runs on micropayments. Monad makes them free-feeling.`,
      ].join("\n");
    case "Meme Context Adapter":
      return `${subject} but it's modular AI skills paying each other in MON while you sip coffee. agents have rent now. they pay it onchain.`;
    case "Brand Positioning Agent":
      return [
        `For: crypto-native builders shipping AI products.`,
        `Replaces: siloed AI tools & off-chain Stripe-style billing.`,
        `Wins because: composable skills + Monad-speed settlement = an agent economy that actually clears.`,
      ].join("\n");
    default:
      return `[${type}] processed "${subject}" with ${name}.`;
  }
}

function mockTweet(subject: string) {
  return `gm. ${subject || "AI workflows"} now compose like Lego — each skill a module, each run settled on @monad_xyz. the agent economy needs a rail. we built one.`;
}
