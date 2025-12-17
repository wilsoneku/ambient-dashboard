// app/(components)/todo/todo-card.tsx
'use client';

import {useLayoutEffect, useMemo, useRef, useState} from 'react';
import type { Task } from '@/lib/types/db-types';
import {MoreHorizontal, Pencil, Star, Trash2} from 'lucide-react';
import {Portal} from "@/app/(components)/shared/portal"; // removed CheckCircle2

type TodoCardProps = {
    task: Task;
    disabled?: boolean;
    onToggleDone(task: Task): void;
    onTogglePinned(task: Task): void;
    onDelete(task: Task): void;
    onSave(
        task: Task,
        patch: Partial<
            Pick<Task, 'title' | 'description' | 'priority' | 'due_at' | 'category'>
        >,
    ): void;
    onOpenDetail(task: Task): void;
};

function formatDue(due_at: Date | null): string | null {
    if (!due_at) return null;
    const d = new Date(due_at);
    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(undefined, opts);
}

export function TodoCard(props: TodoCardProps) {
    const {
        task,
        disabled = false,
        onToggleDone,
        onTogglePinned,
        onDelete,
        onOpenDetail,
    } = props;

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({
        top: 0,
        right: 0,
    });
    const moreButtonRef = useRef<HTMLButtonElement | null>(null);

    const done = task.status === 'done';
    const formattedDue = useMemo(() => formatDue(task.due_at), [task.due_at]);

    const priorityCircleClasses =
        task.priority === 'high'
            ? 'border-red-400 bg-red-500/25'
            : task.priority === 'low'
                ? 'border-sky-400 bg-sky-500/25'
                : task.priority === 'medium'
                    ? 'border-amber-400 bg-amber-500/25'
                    : 'border-zinc-500 bg-transparent';

    // When menu opens, compute viewport position for the portal menu
    useLayoutEffect(() => {
        if (!menuOpen || !moreButtonRef.current) return;
        const rect = moreButtonRef.current.getBoundingClientRect();
        const top = rect.bottom + 6; // a little gap below the button
        const right = window.innerWidth - rect.right - 4; // align with button's right
        setMenuPos({ top, right });
    }, [menuOpen]);

    return (
        <li className="group relative flex flex-col gap-1 rounded-md px-4 py-3
                       hover:bg-card"
        >
            {/* Top row: checkbox + title + pin + delete */}
            <div className="flex items-center gap-3">
                {/* Empty circle whose color encodes priority */}
                <button
                    type="button"
                    onClick={() => onToggleDone(task)}
                    disabled={disabled}
                    className={ `flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition
                         ${done
                            ? 'border-zinc-600 bg-zinc-900/60 text-zinc-500 opacity-70'
                            : `${priorityCircleClasses} opacity-80 hover:opacity-100`
                         }
                        disabled:opacity-40`}
                    aria-label={done ? 'Mark as not done' : 'Mark as done'}
                />

                {/* Title opens detail */}
                <button
                    type="button"
                    onClick={() => onOpenDetail(task)}
                    disabled={disabled}
                    className={`flex-1 truncate text-left transition ${
                        done ? 'text-app/40 line-through' : 'text-app'
                    } hover:text-app disabled:opacity-60`}
                >
                    {task.title}
                </button>

                {/* Right-side actions */}
                <div className="flex items-center gap-1">
                    {/* Pin */}
                    <button
                        type="button"
                        onClick={() => onTogglePinned(task)}
                        disabled={disabled}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition ${
                            task.is_pinned
                                ? 'text-accent'
                                : 'text-app/40 group-hover:text-app/70'
                        } disabled:opacity-60`}
                        aria-label={task.is_pinned ? 'Unpin task' : 'Pin task'}
                    >
                        <Star
                            className="h-3.5 w-3.5"
                            fill={task.is_pinned ? 'currentColor' : 'none'}
                        />
                    </button>

                    {/* More (Edit / Delete) */}
                    <button
                        type="button"
                        ref={moreButtonRef}
                        onClick={() => setMenuOpen(o => !o)}
                        disabled={disabled}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs
                       text-app/40 hover:text-app/80 disabled:opacity-40"
                        aria-label="Task menu"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Description + due date */}
            <div className="flex flex-wrap items-center gap-2 pl-8 text-[11px] text-app/60">
                {task.description && (
                    <span className="max-w-[60%] truncate">{task.description}</span>
                )}

                {formattedDue && (
                    <span className="flex items-center gap-1 text-[11px] text-app/70">
                        {formattedDue}
                    </span>
                )}
            </div>

            {/* Portal menu */}
            {menuOpen && !disabled && (
                <Portal>
                    {/* Backdrop to close on click elsewhere */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuOpen(false)}
                    >
                        <div
                            className="absolute z-50 w-40 rounded-md border border-accent/40
                                       bg-card py-1 text-[11px] text-app shadow-lg shadow-black/40"
                            style={{
                                top: menuPos.top,
                                right: menuPos.right,
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Edit */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onOpenDetail(task); // reuse existing detail/edit UI
                                }}
                                className="flex w-full items-center justify-between px-3 py-1.5
                           text-left text-app/80 hover:bg-accent-soft hover:text-app"
                            >
                                <span>Edit task</span>
                                <Pencil className="h-3 w-3" />
                            </button>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDelete(task);
                                }}
                                className="flex w-full items-center justify-between px-3 py-1.5
                           text-left text-red-300 hover:bg-red-500/15 hover:text-red-200"
                            >
                                <span>Delete task</span>
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </Portal>
            )}
        </li>
    );
}
