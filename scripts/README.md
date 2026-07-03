# Orchor Scripts

This directory contains utility scripts for development and maintenance.

## Available Scripts

### check-db.ts
Database health check script.

**Usage:**
```bash
npm run db:check
# or
ts-node scripts/check-db.ts
```

**Checks:**
- Database connection
- Record counts in all tables
- Confirmed deposits
- Completed skill runs

---

## Adding New Scripts

1. Create a new TypeScript file in this directory
2. Add to package.json scripts if needed
3. Document it here

---

_Last updated: 2025-07-04_
