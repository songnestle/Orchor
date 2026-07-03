#!/bin/bash

echo "🚀 Orchor Quick Start Script"
echo "=============================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found, creating from template..."
    cp .env.local.example .env.local 2>/dev/null || echo "DATABASE_URL=postgresql://user:password@localhost:5432/orchor" > .env.local
    echo "⚠️  Please update DATABASE_URL in .env.local"
else
    echo "✅ .env.local exists"
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
else
    echo "✅ Prisma client generated"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update DATABASE_URL in .env.local (if not done)"
echo "2. Run migrations: npx prisma migrate dev --name init"
echo "3. Seed database: npx prisma db seed"
echo "4. Start dev server: npm run dev"
echo ""
echo "🌐 Then visit: http://localhost:3000"
echo ""
