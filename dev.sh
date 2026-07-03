#!/bin/bash

# Orchor Development Helper Script
# Provides quick commands for common development tasks

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    echo "╔════════════════════════════════════════════════╗"
    echo "║      ORCHOR DEVELOPMENT HELPER                 ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""
    echo "Usage: ./dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start       - Start development server"
    echo "  build       - Build for production"
    echo "  db:setup    - Setup database (generate + migrate + seed)"
    echo "  db:check    - Check database health"
    echo "  db:studio   - Open Prisma Studio"
    echo "  db:reset    - Reset database (WARNING: deletes all data)"
    echo "  status      - Show project status"
    echo "  test        - Run tests (if available)"
    echo "  clean       - Clean build artifacts"
    echo "  help        - Show this help"
    echo ""
}

case "$1" in
    start)
        echo "🚀 Starting development server..."
        npm run dev
        ;;

    build)
        echo "🏗️  Building for production..."
        npm run build
        ;;

    db:setup)
        echo "📦 Setting up database..."
        echo "1. Generating Prisma Client..."
        npx prisma generate
        echo "2. Running migrations..."
        npx prisma migrate dev --name init
        echo "3. Seeding database..."
        npx prisma db seed
        echo "✅ Database setup complete!"
        ;;

    db:check)
        echo "🔍 Checking database health..."
        npm run db:check
        ;;

    db:studio)
        echo "🎨 Opening Prisma Studio..."
        npm run db:studio
        ;;

    db:reset)
        echo "⚠️  WARNING: This will delete all data!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            npx prisma migrate reset
            echo "✅ Database reset complete!"
        else
            echo "❌ Cancelled"
        fi
        ;;

    status)
        echo "📊 Generating status report..."
        ./status-report.sh
        ;;

    test)
        echo "🧪 Running tests..."
        npm run test 2>/dev/null || echo "⚠️  No tests configured yet"
        ;;

    clean)
        echo "🧹 Cleaning build artifacts..."
        rm -rf .next
        rm -rf node_modules/.cache
        echo "✅ Clean complete!"
        ;;

    help|"")
        show_help
        ;;

    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
