import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 技能卡数据
const skills = [
  { id: 1, title: "AI Product Spec Generator", category: "Product", color: "#f093fb" },
  { id: 2, title: "Web3 Research Digest", category: "Research", color: "#667eea" },
  { id: 3, title: "Viral Tweet Composer", category: "Marketing", color: "#4facfe" },
  { id: 4, title: "Smart Contract Auditor", category: "Web3 Dev", color: "#fa709a" },
  { id: 5, title: "Customer Insight Miner", category: "Data", color: "#30cfd0" },
  { id: 6, title: "API Integration Builder", category: "Automation", color: "#43e97b" },
  { id: 7, title: "NFT Metadata Generator", category: "Web3 Dev", color: "#f5576c" },
  { id: 8, title: "DeFi Yield Optimizer", category: "Web3 Dev", color: "#fee140" },
];

const categoryIcons: Record<string, string> = {
  "Product": "🚀",
  "Research": "🔬",
  "Marketing": "📢",
  "Web3 Dev": "⛓️",
  "Data": "📊",
  "Automation": "⚙️",
};

function generateSVG(skill: typeof skills[0]): string {
  const icon = categoryIcons[skill.category] || "✨";

  return `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${skill.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${skill.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${skill.color}80;stop-opacity:0.8" />
    </linearGradient>
    <pattern id="pattern-${skill.id}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="400" height="300" fill="url(#grad-${skill.id})"/>
  <rect width="400" height="300" fill="url(#pattern-${skill.id})"/>

  <!-- Icon -->
  <text x="200" y="150" font-size="80" text-anchor="middle" opacity="0.3"
        filter="drop-shadow(0 0 20px rgba(255,255,255,0.5))">
    ${icon}
  </text>

  <!-- Geometric shapes -->
  <circle cx="80" cy="80" r="30" fill="white" opacity="0.1"/>
  <circle cx="320" cy="220" r="40" fill="white" opacity="0.1"/>
  <rect x="300" y="50" width="60" height="60" fill="white" opacity="0.05" transform="rotate(45 330 80)"/>
</svg>`;
}

async function main() {
  console.log('🎨 生成技能卡图片...\n');

  const outputDir = path.join(process.cwd(), 'public', 'skills');
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const mapping: Record<number, string> = {};

  for (const skill of skills) {
    const svg = generateSVG(skill);
    const filename = `skill-${skill.id}.svg`;
    const filepath = path.join(outputDir, filename);

    await writeFile(filepath, svg);
    mapping[skill.id] = `/skills/${filename}`;

    console.log(`✅ ${skill.id}. ${skill.title}`);
  }

  await writeFile(
    path.join(outputDir, 'mapping.json'),
    JSON.stringify(mapping, null, 2)
  );

  console.log('\n✅ 完成！生成 ' + skills.length + ' 张图片');
  console.log('📁 保存位置: public/skills/');
}

main().catch(console.error);
