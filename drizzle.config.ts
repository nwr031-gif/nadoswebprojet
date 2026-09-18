import type { Config } from 'drizzle-kit';

// For migrations (db:push) use the DIRECT Supabase connection (port 5432) when
// available — the transaction pooler (6543) is not suitable for DDL.
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: (process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL)!,
  },
} satisfies Config;