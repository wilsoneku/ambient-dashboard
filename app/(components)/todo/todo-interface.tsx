// components/TodoInterface.tsx
'use client';

import { useState, useTransition } from 'react';
import type { Task } from '@/lib/types/db-types';
import {
    createTaskAction,
    toggleTaskDoneAction,
    setTaskPinnedAction,
    deleteTaskAction,
    updateTaskFieldsAction,
} from '@/lib/actions/todo-actions';
import { TodoCard} from "@/app/(components)/todo/todo-card";
import {TodoItemDetails} from "@/app/(components)/todo/todo-item-details";
import {TodoAddBar} from "@/app/(components)/todo/todo-add-bar";
import {TodoInterfaceProps, TodoTexts} from "@/lib/types/todo-types";
import {Portal} from "@/app/(components)/shared/portal";

const DEFAULT_TEXTS: TodoTexts = {
    heading: 'Today',
    emptyState: 'All Tasks Completed',
    inputPlaceholder: 'Task name',
    addButton: 'Add',
    leftLabel: 'left',
};

export function TodoInterface({
                                  userId,
                                  initialTasks,
                                  texts,
                                  className = '',
                              }: TodoInterfaceProps) {
    const t: TodoTexts = { ...DEFAULT_TEXTS, ...(texts ?? {}) };
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const [detailTask, setDetailTask] = useState<Task | null>(null);

    const remaining = tasks.filter(t => t.status !== 'done').length;

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        const title = input.trim();
        if (!title) return;

        startTransition(async () => {
            const created = await createTaskAction({
                user_id: userId,
                title,
            });
            setTasks(prev => [created, ...prev]);
            setInput('');
        });
    }

    function handleToggleDone(task: Task) {
        startTransition(async () => {
            const updated = await toggleTaskDoneAction({
                user_id: userId,
                task_id: task.id,
            });
            if (!updated) return;
            setTasks(prev =>
                prev.map(t => (t.id === updated.id ? updated : t)),
            );
        });
    }

    function handleTogglePinned(task: Task) {
        startTransition(async () => {
            const updated = await setTaskPinnedAction({
                user_id: userId,
                task_id: task.id,
                is_pinned: !task.is_pinned,
            });
            if (!updated) return;
            setTasks(prev =>
                prev.map(t => (t.id === updated.id ? updated : t)),
            );
        });
    }

    function handleDelete(task: Task) {
        startTransition(async () => {
            await deleteTaskAction({
                user_id: userId,
                task_id: task.id,
            });
            setTasks(prev => prev.filter(t => t.id !== task.id));
        });
    }

    function handleSave(task: Task, patch: Partial<Task>) {
        startTransition(async () => {
            const updated = await updateTaskFieldsAction({
                user_id: userId,
                task_id: task.id,
                patch: {
                    title: patch.title,
                    description: patch.description,
                    priority: patch.priority,
                    category: patch.category,
                    due_at: patch.due_at ?? null,
                },
            });
            if (!updated) return;
            setTasks(prev =>
                prev.map(t => (t.id === updated.id ? updated : t)),
            );
        });
    }

    function openDetail(task: Task) {
        setDetailTask(task);
    }

    function closeDetail() {
        setDetailTask(null);
    }

    return (
        <div className={`${className}`}
        >
            {/* Component Header */}
            <header className="flex items-baseline justify-between gap-2 px-4 py-2">
                <span className="text-base font-semibold text-app">
                    {t.heading}
                </span>
                <span className="text-xs text-app/70">
                    {remaining} {t.leftLabel}
                </span>
            </header>

            {/* Todo Cards */}
            <section className="flex-1 overflow-y-auto pr-0.5 pt-1 pb-2">
                {tasks.length === 0 && !isPending ? (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-xs text-app/60">{t.emptyState}</p>
                    </div>
                ) : (
                    <ul className="">
                        {tasks.map(task => (
                            <TodoCard
                                key={task.id}
                                task={task}
                                disabled={isPending}
                                onToggleDone={handleToggleDone}
                                onTogglePinned={handleTogglePinned}
                                onDelete={handleDelete}
                                onSave={handleSave}
                                onOpenDetail={openDetail}
                            />
                        ))}
                    </ul>
                )}
            </section>

            {/*Details Portal (pop-up)*/}
            {detailTask && (
                <Portal>
                    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
                         onClick={closeDetail}
                    >
                        <div
                            className="absolute left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2
                                       p-4 rounded-xl border border-accent-soft bg-card/95 text-app
                                       shadow-xl shadow-black/60"
                            onClick={e => e.stopPropagation()}
                        >
                            <TodoItemDetails
                                task={detailTask}
                                open
                                disabled={isPending}
                                onClose={closeDetail}
                                onSave={handleSave}
                            />
                        </div>
                    </div>
                </Portal>
            )}

            <section className="">
                {/* Input Button / Bar */}
                <TodoAddBar
                    value={input}
                    disabled={isPending}
                    placeholder={t.inputPlaceholder}
                    onChange={setInput}
                    onSubmit={title => {
                        startTransition(async () => {
                            const created = await createTaskAction({
                                user_id: userId,
                                title,
                            });
                            setTasks(prev => [created, ...prev]);
                            setInput('');
                        });
                    }}
                />
            </section>
        </div>
    );
}
