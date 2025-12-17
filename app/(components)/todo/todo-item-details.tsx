// app/(components)/todo/TodoDetailDialog.tsx
'use client';

import { useState, useMemo } from 'react';
import type { Task } from '@/lib/types/db-types';

type TodoDetailDialogProps = {
    task: Task;
    open: boolean;
    disabled?: boolean;
    onClose(): void;
    onSave(task: Task, patch: Partial<Pick<Task, 'title' | 'description' | 'priority' | 'due_at' | 'category'>>): void;
};

type Priority = NonNullable<Task['priority']>;
type Category = NonNullable<Task['category']>;

function formatDue(due_at: Date | null): string | null {
    if (!due_at) return null;
    const d = new Date(due_at);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const dateStr = d.toLocaleDateString(undefined, opts);
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${dateStr} · ${timeStr}`;
}

export function TodoItemDetails({
                                     task,
                                     open,
                                     disabled = false,
                                     onClose,
                                     onSave,
                                 }: TodoDetailDialogProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? '');
    const [priority, setPriority] = useState<Priority>(task.priority ?? 'medium');
    const [category, setCategory] = useState<Category>(task.category ?? 'today');
    const [due, setDue] = useState(
        task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : '',
    );

    const formattedDue = useMemo(() => formatDue(task.due_at), [task.due_at]);

    if (!open) return null;

    function handleSave() {
        const patch: Partial<Task> = {
            title: title.trim() || task.title,
            description: description.trim() || null,
            priority,
            category,
            due_at: due ? new Date(due) : null,
        };
        onSave(task, patch);
        onClose();
    }

    function handleCancel() {
        setTitle(task.title);
        setDescription(task.description ?? '');
        setPriority(task.priority ?? 'medium');
        setCategory(task.category ?? 'today');
        setDue(task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : '');
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button
                type="button"
                aria-label="Close"
                onClick={handleCancel}
                className="fixed inset-0 bg-black/50"
            />
            <div className="relative z-50 w-full max-w-md rounded-lg bg-zinc-900 p-4 shadow-lg">
                <h2 className="mb-2 text-base font-semibold text-zinc-100">
                    Task details
                </h2>

                <div className="flex flex-col gap-3 text-sm text-zinc-200">
                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-400">Title</span>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="rounded-md border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                            disabled={disabled}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-400">Notes</span>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="rounded-md border border-zinc-700 bg-black px-2 py-1 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                            disabled={disabled}
                        />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-zinc-400">Due</span>
                            <input
                                type="datetime-local"
                                value={due}
                                onChange={e => setDue(e.target.value)}
                                className="rounded-md border border-zinc-700 bg-black px-2 py-1 text-[11px] text-zinc-100 outline-none focus:border-emerald-400"
                                disabled={disabled}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-zinc-400">Priority</span>
                            <select
                                value={priority}
                                onChange={e => setPriority(e.target.value as Priority)}
                                className="rounded-md border border-zinc-700 bg-black px-2 py-1 text-[11px] text-zinc-100 outline-none focus:border-emerald-400"
                                disabled={disabled}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-xs text-zinc-400">Category</span>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value as Category)}
                                className="rounded-md border border-zinc-700 bg-black px-2 py-1 text-[11px] text-zinc-100 outline-none focus:border-emerald-400"
                                disabled={disabled}
                            >
                                <option value="today">Today</option>
                                <option value="this_week">This week</option>
                                <option value="someday">Someday</option>
                                <option value="backlog">Backlog</option>
                            </select>
                        </label>
                    </div>

                    {formattedDue && (
                        <p className="text-xs text-zinc-500">
                            Currently due: {formattedDue}
                        </p>
                    )}
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-xs text-zinc-400 hover:text-zinc-200"
                        disabled={disabled}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="text-xs font-medium text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
                        disabled={disabled}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
