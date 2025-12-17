// lib/db-types.ts
import type {
    Generated,
    Selectable,
    Insertable,
    Updateable,
} from 'kysely';

/**
 * BetterAuth `user` table as created by Prisma.
 * Table name is "user" (via @@map("user")), columns use camelCase.
 */
export interface UserTable {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    username: string | null;
    displayUsername: string | null;
}

/**
 * Lists owned by a BetterAuth user.
 * Created by Kysely init script with snake_case columns.
 */
export interface ListsTable {
    id: Generated<number>;
    user_id: string;               // FK → user.id
    name: string;
    color: string | null;
    icon: string | null;
    order_index: number | null;
    created_at: Generated<Date>;
}

/**
 * Tasks belonging to a list/user.
 * Created by Kysely init script with snake_case columns.
 */
export interface TasksTable {
    id: Generated<number>;
    user_id: string;               // FK → user.id
    list_id: number | null;        // FK → lists.id
    title: string;
    description: string | null;
    status: string;
    priority: 'low' | 'medium' | 'high';
    due_at: Date | null;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
    order_index: number | null;
    category: 'today' | 'this_week' | 'someday' | 'backlog';
    is_pinned: Generated<boolean>;
}

/**
 * Kysely Database shape.
 */
export interface Database {
    user: UserTable;
    lists: ListsTable;
    tasks: TasksTable;
}

/**
 * Convenience types for rows and mutations.
 */
export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export type List = Selectable<ListsTable>;
export type NewList = Insertable<ListsTable>;
export type ListUpdate = Updateable<ListsTable>;

export type Task = Selectable<TasksTable>;
export type NewTask = Insertable<TasksTable>;
export type TaskUpdate = Updateable<TasksTable>;
