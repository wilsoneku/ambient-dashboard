// lib/actions/todo-actions.ts
'use server';

import { sql } from 'kysely';
import { db } from '@/lib/actions/db';
import type {
    List,
    NewList,
    ListUpdate,
    Task,
    NewTask,
    TaskUpdate,
} from '@/lib/types/db-types';

/**
 * Fetch all lists for a user, ordered by order_index then created_at.
 */
export async function fetchLists(user_id: string): Promise<List[]> {
    return db
        .selectFrom('lists')
        .selectAll()
        .where('user_id', '=', user_id)
        .orderBy('order_index')
        .orderBy('created_at')
        .execute();
}

/**
 * Fetch tasks for a user.
 * Optionally filter by list_id (null = inbox/no list).
 */
export async function fetchTasks(
    user_id: string,
    opts?: { list_id?: number | null },
): Promise<Task[]> {
    let q = db
        .selectFrom('tasks')
        .selectAll()
        .where('user_id', '=', user_id);

    if (opts?.list_id !== undefined) {
        q =
            opts.list_id === null
                ? q.where('list_id', 'is', null)
                : q.where('list_id', '=', opts.list_id);
    }

    return q
        .orderBy('is_pinned desc')
        .orderBy('category')
        .orderBy('order_index')
        .orderBy('created_at')
        .execute();
}

/**
 * Create a new list for a user.
 */
export async function createListAction(input: {
    user_id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
}): Promise<List> {
    const values: NewList = {
        user_id: input.user_id,
        name: input.name,
        color: input.color ?? null,
        icon: input.icon ?? null,
        order_index: null,
        // created_at is Generated, DB default (now())
    };

    const [list] = await db
        .insertInto('lists')
        .values(values)
        .returningAll()
        .execute();

    return list;
}

/**
 * Update list metadata (name/color/icon/order_index).
 */
export async function updateListAction(input: {
    list_id: number;
    user_id: string;
    patch: Partial<Pick<ListUpdate, 'name' | 'color' | 'icon' | 'order_index'>>;
}): Promise<List | undefined> {
    const { list_id, user_id, patch } = input;

    const [updated] = await db
        .updateTable('lists')
        .set(patch)
        .where('id', '=', list_id)
        .where('user_id', '=', user_id)
        .returningAll()
        .execute();

    return updated;
}

/**
 * Delete a list for a user.
 * Tasks behaviour depends on your FK (currently list_id ON DELETE SET NULL).
 */
export async function deleteListAction(params: {
    list_id: number;
    user_id: string;
}): Promise<void> {
    const { list_id, user_id } = params;

    await db
        .deleteFrom('lists')
        .where('id', '=', list_id)
        .where('user_id', '=', user_id)
        .execute();
}

/**
 * Create a new task for a user.
 */
export async function createTaskAction(input: {
    user_id: string;
    title: string;
    description?: string;
    list_id?: number | null;
    category?: Task['category'];
    priority?: Task['priority'];
    due_at?: Date | null;
}): Promise<Task> {
    const values: NewTask = {
        user_id: input.user_id,
        title: input.title,
        description: input.description ?? null,
        status: 'todo',
        priority: input.priority ?? 'medium',
        category: input.category ?? 'today',
        list_id: input.list_id ?? null,
        order_index: null,
        due_at: input.due_at ?? null,
        // created_at / updated_at: DB defaults
        is_pinned: false,
    };

    const [task] = await db
        .insertInto('tasks')
        .values(values)
        .returningAll()
        .execute();

    return task;
}

/**
 * Toggle a task between done <-> todo for a user.
 */
export async function toggleTaskDoneAction(params: {
    user_id: string;
    task_id: number;
}): Promise<Task | undefined> {
    const { user_id, task_id } = params;

    const [updated] = await db
        .updateTable('tasks')
        .set(eb => ({
            status: eb
                .case()
                .when('status', '=', 'done')
                .then('todo')
                .else('done')
                .end(),
            updated_at: sql`now()`,
        }))
        .where('id', '=', task_id)
        .where('user_id', '=', user_id)
        .returningAll()
        .execute();

    return updated;
}


/**
 * Pin or unpin a task.
 */
export async function setTaskPinnedAction(params: {
    user_id: string;
    task_id: number;
    is_pinned: boolean;
}): Promise<Task | undefined> {
    const { user_id, task_id, is_pinned } = params;

    const patch: TaskUpdate = {
        is_pinned,
        updated_at: sql`now()` as unknown as Date,
    };

    const [updated] = await db
        .updateTable('tasks')
        .set(patch)
        .where('id', '=', task_id)
        .where('user_id', '=', user_id)
        .returningAll()
        .execute();

    return updated;
}

/**
 * Update order_index for a task (e.g., after drag-and-drop).
 */
export async function updateTaskOrderAction(params: {
    user_id: string;
    task_id: number;
    order_index: number | null;
}): Promise<Task | undefined> {
    const { user_id, task_id, order_index } = params;

    const patch: TaskUpdate = {
        order_index,
        updated_at: sql`now()` as unknown as Date,
    };

    const [updated] = await db
        .updateTable('tasks')
        .set(patch)
        .where('id', '=', task_id)
        .where('user_id', '=', user_id)
        .returningAll()
        .execute();

    return updated;
}

/**
 * Move a task to another list (or to inbox with list_id = null).
 */
export async function moveTaskToListAction(params: {
    user_id: string;
    task_id: number;
    list_id: number | null;
}): Promise<Task | undefined> {
    const { user_id, task_id, list_id } = params;

    const patch: TaskUpdate = {
        list_id,
        updated_at: sql`now()` as unknown as Date,
    };

    const [updated] = await db
        .updateTable('tasks')
        .set(patch)
        .where('id', '=', task_id)
        .where('user_id', '=', user_id)
        .returningAll()
        .execute();

    return updated;
}

/**
 * Delete a task for a user.
 */
export async function deleteTaskAction(params: {
    user_id: string;
    task_id: number;
}): Promise<void> {
    const { user_id, task_id } = params;

    await db
        .deleteFrom('tasks')
        .where('id', '=', task_id)
        .where('user_id', '=', user_id)
        .execute();
}


/**
 * Update editable fields of a task (title, description, priority, due_at, category).
 */
export async function updateTaskFieldsAction(params: {
    user_id: string;
    task_id: number;
    patch: Partial<Pick<TaskUpdate, 'title' | 'description' | 'priority' | 'due_at' | 'category'>>;
}): Promise<Task | undefined> {
    const { user_id, task_id, patch } = params;

    const fullPatch: TaskUpdate = {
        ...patch,
        updated_at: sql`now()` as unknown as Date,
    };

    const [updated] = await db
        .updateTable('tasks')
        .set(fullPatch)
        .where('id', '=', task_id)
        .where('user_id', '=', user_id)
        .returningAll()
        .execute();

    return updated;
}