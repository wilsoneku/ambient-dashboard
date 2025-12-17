// lib/db.ts
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from '@/lib/types/db-types';

function createDb() {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

    const url = new URL(DATABASE_URL);
    const dialect = new PostgresDialect({
        pool: new Pool({
            host: url.hostname,
            port: parseInt(url.port || '5432', 10),
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            ssl: { rejectUnauthorized: false },
            max: 10,
        }),
    });

    return new Kysely<Database>({ dialect });
}

const globalForDb = globalThis as unknown as { _db?: Kysely<Database> };

export const db = globalForDb._db ?? (globalForDb._db = createDb());
