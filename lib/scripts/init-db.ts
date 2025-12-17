// scripts/init-db.ts
import 'dotenv/config';
import { db } from '@/lib/actions/db';
import {sql} from "kysely";

async function main() {
    // lists – tied to BetterAuth user
    await db.schema
        .createTable('lists')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'varchar(255)', col =>
            col.notNull().references('user.id').onDelete('cascade'),
        )
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('color', 'varchar(32)')
        .addColumn('icon', 'varchar(64)')
        .addColumn('order_index', 'integer')
        .addColumn('created_at', 'timestamptz', col =>
            col.notNull().defaultTo(sql`now()`),
        )
        .execute();

    // tasks – tied to both user and list
    await db.schema
        .createTable('tasks')
        .ifNotExists()
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('user_id', 'varchar(255)', col =>
            col.notNull().references('user.id').onDelete('cascade'),
        )
        .addColumn('list_id', 'integer', col =>
            col.references('lists.id').onDelete('set null'),
        )
        .addColumn('title', 'varchar(255)', col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('status', 'varchar(32)', col => col.notNull().defaultTo('todo'))
        .addColumn('priority', 'varchar(16)', col => col.notNull().defaultTo('medium'))
        .addColumn('due_at', 'timestamptz')
        .addColumn('created_at', 'timestamptz', col =>
            col.notNull().defaultTo(sql`now()`),
        )
        .addColumn('updated_at', 'timestamptz', col =>
            col.notNull().defaultTo(sql`now()`),
        )
        .addColumn('order_index', 'integer')
        .addColumn('category', 'varchar(32)', col => col.notNull().defaultTo('today'))
        .addColumn('is_pinned', 'boolean', col => col.notNull().defaultTo(false))
        .execute();

    await db.destroy();
    console.log('Lists + tasks tables initialized');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
