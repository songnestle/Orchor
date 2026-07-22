/**
 * Generate retro 16-bit pixel-art card images for all 12 skills.
 * Usage:
 *   npx tsx scripts/generate-retro-images.ts           # all 12
 *   npx tsx scripts/generate-retro-images.ts 0         # just skill 0 (connectivity test)
 *   npx tsx scripts/generate-retro-images.ts 0 3 7     # a subset
 *
 * Writes to public/skills/skill-<id>.png (overwrites the old cyberpunk art).
 */
import OpenAI from "openai";
import { writeFile, mkdir } from "fs/promises";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

// Resumable progress: ids already converted to retro art are skipped on re-run.
const STATE_FILE = path.join(process.cwd(), "scripts", ".retro-done.json");
function loadDone(): Set<number> {
  try {
    return new Set(JSON.parse(readFileSync(STATE_FILE, "utf8")));
  } catch {
    return new Set();
  }
}
function markDone(id: number) {
  const s = loadDone();
  s.add(id);
  writeFileSync(STATE_FILE, JSON.stringify([...s].sort((a, b) => a - b)));
}

const openai = new OpenAI({
  apiKey: "sk-ca945276d582a1f88fe37af6d241d4525d75d2fe654d88df8407b2436afbf357",
  baseURL: "https://openapi.junliai.org/v1",
});

// Shared style suffix — keeps all 12 visually consistent.
const STYLE =
  "16-bit pixel art, retro SNES JRPG style, warm muted earthy color palette " +
  "(aged gold, mossy green, dusty red, deep charcoal, cream), limited color count, " +
  "chunky pixels, dithering shading, no text, no letters, centered icon composition, " +
  "dark warm background, cozy game aesthetic like Stardew Valley and Octopath Traveler.";

const skills: { id: number; scene: string }[] = [
  { id: 0, scene: "a magnifying glass over glowing scrolls and data charts on an ancient research desk, treasure-map vibe" },
  { id: 1, scene: "a glowing shield with a lock guarding a treasure chest of code runes, protective ward" },
  { id: 2, scene: "an old parchment world map with glowing territory markers and connected nodes, cartography" },
  { id: 3, scene: "a spyglass telescope on a watchtower scanning distant flags, lookout scout" },
  { id: 4, scene: "a quest board with pinned scrolls and a branching path map, adventurer planning table" },
  { id: 5, scene: "a cozy tavern conversation with glowing speech bubbles around a wooden table" },
  { id: 6, scene: "a rocket signal flare launching with radiating banners, festival announcement" },
  { id: 7, scene: "a magnifying lens revealing hidden runes on an ancient scroll, decoding a contract" },
  { id: 8, scene: "a wizard tower with connected machinery and glowing pipes, a building workshop" },
  { id: 9, scene: "a glowing crystal heart pulsing with energy streams, a magical data core" },
  { id: 10, scene: "a party of small glowing robot familiars working together in a chain" },
  { id: 11, scene: "a playful jester with floating emoji orbs and confetti, a cheerful trickster" },
  // Imported open-source skills (12-19)
  { id: 12, scene: "a dwarven forge assembling glowing connector bridges between floating machines, plug and socket motif" },
  { id: 13, scene: "a clockwork automaton inspecting a miniature castle with a checklist scroll and lantern, quality inspector" },
  { id: 14, scene: "an artist's atelier with floating color swatches, golden ratio grids and a single glowing gem centerpiece" },
  { id: 15, scene: "a wizard forging a small glowing spellbook that births tinier spellbooks, meta-magic creation altar" },
  { id: 16, scene: "a blacksmith hammering a glowing ethereum crystal diamond on an anvil, sparks of code runes" },
  { id: 17, scene: "a fortress gate with layered magical barriers, watchful sentry owls and warning sigils" },
  { id: 18, scene: "an alchemist distilling swirling data potions into a clear insight elixir, charts on parchment" },
  { id: 19, scene: "a tiny gnome weaving an intricate glowing thread pattern on a small loom, precise lacework" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Both models are valid but flaky/overloaded; rotate through them.
const MODELS = ["gpt-image-2", "gpt-image-1"];

async function generateOnce(skill: { id: number; scene: string }, model: string) {
  const prompt = `A retro pixel-art game icon: ${skill.scene}. ${STYLE}`;
  const response = await openai.images.generate({ model, prompt, n: 1, size: "1024x1024" });
  const item: any = response.data?.[0];
  let buffer: Buffer;
  if (item?.url) {
    const res = await fetch(item.url);
    buffer = Buffer.from(await res.arrayBuffer());
  } else if (item?.b64_json) {
    buffer = Buffer.from(item.b64_json, "base64");
  } else {
    throw new Error("no url or b64_json in response");
  }
  const outDir = path.join(process.cwd(), "public", "skills");
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, `skill-${skill.id}.png`), buffer);
  markDone(skill.id);
  console.log(`✅ saved skill-${skill.id}.png via ${model} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

async function generate(skill: { id: number; scene: string }) {
  console.log(`\n🎨 skill-${skill.id}`);
  const MAX = 24; // grind through server overload
  for (let attempt = 1; attempt <= MAX; attempt++) {
    const model = MODELS[attempt % MODELS.length];
    try {
      await generateOnce(skill, model);
      return true;
    } catch (err: any) {
      const msg = (err?.message || String(err)).slice(0, 80);
      console.error(`  [${skill.id}] try ${attempt}/${MAX} ${model}: ${msg}`);
      if (attempt < MAX) await sleep(Math.min(3000 + attempt * 1500, 15000));
    }
  }
  console.error(`❌ skill-${skill.id} gave up after ${MAX} attempts`);
  return false;
}

async function main() {
  const argIds = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
  const done = loadDone();
  const requested = argIds.length ? skills.filter((s) => argIds.includes(s.id)) : skills;
  const targets = requested.filter((s) => !done.has(s.id)); // skip already-converted
  if (!targets.length) {
    console.log(`✅ nothing to do — all requested ids already converted (done: [${[...done].sort((a,b)=>a-b).join(", ")}])`);
    return;
  }
  console.log(`🚀 generating ${targets.length} retro image(s): [${targets.map((t) => t.id).join(", ")}] (skipping done: [${[...done].sort((a,b)=>a-b).join(", ")}])`);

  let ok = 0;
  for (const s of targets) {
    if (await generate(s)) ok++;
    await new Promise((r) => setTimeout(r, 3000)); // rate-limit
  }
  console.log(`\n==== done: ${ok}/${targets.length} succeeded ====`);
}

main().catch(console.error);
