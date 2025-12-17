// app/(components)/todo/todo-add-bar.tsx
'use client';

import {useEffect, useState} from 'react';
import {CalendarDays, Flag, Bell, MoreHorizontal, Plus} from 'lucide-react';

type TodoAddBarProps = {
    value: string;
    disabled?: boolean;
    placeholder?: string;
    onChange(next: string): void;
    onSubmit(title: string): void;
};

export function TodoAddBar({
                               value,
                               disabled = false,
                               placeholder,
                               onChange,
                               onSubmit,
                           }: TodoAddBarProps) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

    function handleOpen() {
        if (disabled) return;
        setOpen(true);
    }

    function handleCancel() {
        if (disabled) return;
        setOpen(false);
        onChange('');
        setDescription('');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const title = value.trim();
        if (!title) return;
        onSubmit(title);
        setOpen(false);
        onChange('');
        setDescription('');
    }

    // Open on Shift + Enter
    useEffect(() => {
        if (open || disabled) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter' && e.shiftKey && !e.repeat) {
                e.preventDefault();
                handleOpen();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, disabled]);

    // Close on Esc
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, disabled, value]);

    // Expanded panel
    return (
        <div className="mt-3 w-full">
            {/* New Task button (collapsed panel) */}
            <div
                className={`flex w-full justify-end 
                            transition-all duration-200 ease-in-out ${open 
                            ? 'translate-y-2 opacity-0 pointer-events-none' 
                            : 'translate-y-0 opacity-100'}`}
            >
                <button
                    type="button"
                    onClick={handleOpen}
                    disabled={disabled}
                    className="flex items-center gap-2 rounded-full border border-accent p-2 mr-6 mb-4
                               text-sm text-app/60 hover:text-app disabled:opacity-50"
                >
                    <Plus className="size-5 text-accent" strokeWidth={2} />
                </button>
            </div>

            {/* Expanded New Task panel */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${open
                            ? 'max-h-96 translate-y-0 opacity-100'
                            : 'max-h-0 -translate-y-2 opacity-0 pointer-events-none'}`}
            >
                <form
                    onSubmit={handleSubmit}
                    className="mt-2 flex w-full flex-col gap-2 rounded-t-2xl rounded-b-md
                               bg-card px-3 py-2 text-sm"
                >
                    {/* Title + description */}
                    <div className="flex flex-col gap-1">
                        <input
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            placeholder={placeholder}
                            autoFocus
                            disabled={disabled}
                            className="w-full text-lg text-app px-0.5 py-1
                                       border-b border-accent-soft
                                       placeholder:text-app/40
                                       focus:outline-none"
                        />
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Description"
                            rows={isDescriptionFocused ? 3 : 1}
                            onFocus={() => setIsDescriptionFocused(true)}
                            onBlur={() => setIsDescriptionFocused(false)}
                            disabled={disabled}
                            className="w-full text-sm text-app px-0.5 pt-1
                                       placeholder:text-app/35 resize-none
                                       focus:outline-none"
                        />
                    </div>


                    {/* Bottom row */}
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                        {/* Attribute chips */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <button
                                type="button"
                                disabled={disabled}
                                className="inline-flex items-center gap-1 rounded-md border border-accent/40
                                           bg-card/90 px-2 py-1 text-app/70 hover:bg-accent-soft hover:text-app
                                           disabled:opacity-40"
                            >
                                <CalendarDays className="h-3 w-3" />
                                <span>Date</span>
                            </button>
                            <button
                                type="button"
                                disabled={disabled}
                                className="inline-flex items-center gap-1 rounded-md border border-accent/40
                                           bg-card/90 px-2 py-1 text-app/70 hover:bg-accent-soft hover:text-app
                                           disabled:opacity-40"
                            >
                                <Flag className="h-3 w-3" />
                                <span>Priority</span>
                            </button>
                            <button
                                type="button"
                                disabled={disabled}
                                className="inline-flex items-center gap-1 rounded-md border border-accent/40
                                           bg-card/90 px-2 py-1 text-app/70 hover:bg-accent-soft hover:text-app
                                           disabled:opacity-40"
                            >
                                <Bell className="h-3 w-3" />
                                <span>Reminders</span>
                            </button>
                            <button
                                type="button"
                                disabled={disabled}
                                className="inline-flex items-center justify-center rounded-md border border-accent/40
                                           bg-card/90 px-2 py-1 text-app/70 hover:bg-accent-soft hover:text-app
                                           disabled:opacity-40"
                            >
                                <MoreHorizontal className="h-3 w-3" />
                            </button>
                        </div>

                        <button
                            type="button"
                            disabled={disabled}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-app/70
                                           hover:bg-accent-soft/60 hover:text-app disabled:opacity-40"
                        >
                            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                            <span>Inbox</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={disabled}
                                className="rounded-md border bg-card px-3 py-1 text-[13px] text-app
                                           hover:bg-accent disabled:opacity-40"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={disabled || !value.trim()}
                                className="rounded-md bg-accent-soft px-3 py-2 font-medium text-[15px] text-app
                                           hover:bg-accent disabled:opacity-40"
                            >
                                Add task
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
