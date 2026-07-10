import OpenAI from 'openai';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: 'sk-ca945276d582a1f88fe37af6d241d4525d75d2fe654d88df8407b2436afbf357',
  baseURL: 'https://openapi.junliai.org/v1',
});

const skills = [
  { id: 0, title: "AI Product Spec Generator", category: "Product" },
  { id: 1, title: "Web3 Research Digest", category: "Research" },
  { id: 2, title: "Viral Tweet Composer", category: "Marketing" },
  { id: 3, title: "Smart Contract Auditor", category: "Web3 Dev" },
  { id: 4, title: "Customer Insight Miner", category: "Data" },
  { id: 5, title: "API Integration Builder", category: "Automation" },
  { id: 6, title: "NFT Metadata Generator", category: "Web3 Dev" },
  { id: 7, title: "DeFi Yield Optimizer", category: "Web3 Dev" },
  { id: 8, title: "Token Price Oracle", category: "Data" },
  { id: 9, title: "Social Media Manager", category: "Marketing" },
  { id: 10, title: "DAO Governance Helper", category: "Web3 Dev" },
  { id: 11, title: "Code Reviewer", category: "Automation" },
];

async function generateImage(skill: typeof skills[0]) {
  console.log(`\n🎨 ${skill.title}`);

  const prompt = `A futuristic holographic trading card artwork for "${skill.title}".
Category: ${skill.category}.
Style: Cyberpunk, neon colors, glowing effects, technological, premium quality.
Digital art, sci-fi aesthetic, highly detailed.
No text or words, only visual artwork.`;

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-2',
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) throw new Error('未返回图片 URL');

    console.log(`  下载中...`);
    const imageRes = await fetch(imageUrl);
    const buffer = await imageRes.arrayBuffer();

    const outputDir = path.join(process.cwd(), 'public', 'skills');
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    const filename = `skill-${skill.id}.png`;
    await writeFile(path.join(outputDir, filename), Buffer.from(buffer));

    console.log(`✅ 已保存: ${filename}`);
    return `/skills/${filename}`;
  } catch (error: any) {
    console.error(`❌ 失败: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 使用 gpt-image-2 生成卡片图片\n');

  const results = [];
  for (const skill of skills) {
    const imagePath = await generateImage(skill);
    results.push({ id: skill.id, path: imagePath });

    // 避免 API 限流
    if (imagePath) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const mapping = results.reduce((acc, r) => {
    if (r.path) acc[r.id] = r.path;
    return acc;
  }, {} as Record<number, string>);

  await writeFile(
    path.join(process.cwd(), 'public', 'skills', 'mapping.json'),
    JSON.stringify(mapping, null, 2)
  );

  console.log('\n====================================');
  console.log('✅ 生成完成！');
  console.log(`成功: ${results.filter(r => r.path).length}/${results.length}`);
}

main().catch(console.error);
