# 🚀 Orchor Quick Start Guide

## 最快速的启动方式

### 方法 1: 自动脚本 (推荐)

```bash
cd /Users/nestle/Orchor
chmod +x setup.sh
./setup.sh
npm run dev
```

访问: http://localhost:3000

---

### 方法 2: 手动启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

访问: http://localhost:3000

---

## 📝 数据库设置 (可选)

如果需要测试完整功能:

```bash
# 1. 设置数据库 URL
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/orchor"' >> .env.local

# 2. 生成 Prisma Client
npx prisma generate

# 3. 运行 Migrations
npx prisma migrate dev --name init

# 4. 填充测试数据
npx prisma db seed

# 5. 查看数据库
npx prisma studio
```

---

## 🎯 可用页面

- **首页:** http://localhost:3000
- **创作者仪表盘:** http://localhost:3000/creator
- **交易历史:** http://localhost:3000/transactions

---

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据库
npm run db:check         # 检查数据库健康
npm run db:studio        # 打开 Prisma Studio
npm run db:seed          # 填充测试数据
npm run db:migrate       # 运行 Migrations
```

---

## 🎉 就这么简单！

现在你可以:
- 浏览技能市场
- 连接钱包查看 Credits
- 测试充值流程
- 查看创作者仪表盘
- 浏览交易历史

**准备好参加 HTX 黑客松了！** 🚀
