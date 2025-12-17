// app/(components)/shell/app-menu.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AuthDialog } from '@/app/(components)/auth/auth-dialog';
import { ThemeName, useTheme } from '@/app/(components)/theme/theme-provider';

type AppMenuProps = {
    userName?: string | null;
};

export function AppMenu({ userName }: AppMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const isLoggedIn = !!userName;

    return (
        <>
            <div className="relative flex flex-col items-end text-xs text-app">
                {/* Burger */}
                <button
                    type="button"
                    onClick={() => setMenuOpen(o => !o)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition
            ${
                        isLoggedIn
                            ? 'border-accent text-app hover:bg-accent-soft'
                            : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800/80'
                    }`}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                >
                    {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>

                {menuOpen && (
                    <div
                        className="mt-3 w-80 rounded-2xl border border-accent/40 bg-card/95 p-4
                       text-[11px] shadow-xl shadow-black/60 backdrop-blur"
                    >
                        {/* Header row */}
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                <span className="max-w-[11rem] truncate text-[11px] font-medium text-app">
                  {isLoggedIn ? userName : 'Ambient dashboard'}
                </span>
                                <span className="text-[10px] text-zinc-500">
                  {isLoggedIn ? 'Signed in' : 'Not signed in'}
                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAuthOpen(true)}
                                className="rounded-full border border-accent/60 px-3 py-1 text-[10px] font-medium text-app hover:bg-accent-soft"
                            >
                                {isLoggedIn ? 'Manage account' : 'Sign in'}
                            </button>
                        </div>

                        {/* Sections */}
                        <div className="space-y-3 border-t border-zinc-800 pt-3">
                            <ThemeSection />

                            <div className="space-y-1 border-t border-zinc-800 pt-3">
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-md px-2 py-1 hover:bg-zinc-900/70"
                                >
                                    <span className="text-app">Settings</span>
                                    <span className="text-[10px] text-zinc-500">Coming soon</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} userName={userName} />
        </>
    );
}

function ThemeSection() {
    const { theme, setTheme } = useTheme();

    const options: { id: ThemeName; label: string; hint: string }[] = [
        { id: 'default', label: 'Default', hint: 'Purplish' },
        { id: 'pixel-campfire-1', label: 'Campfire I', hint: 'Deep navy' },
        { id: 'pixel-campfire-2', label: 'Campfire II', hint: 'Midnight' },
    ];

    return (
        <section className="space-y-2">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">Theme</div>
            <div className="grid grid-cols-2 gap-2">
                {options.map(opt => {
                    const active = theme === opt.id;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setTheme(opt.id)}
                            className={`flex flex-col items-start rounded-xl border px-3 py-2 text-[10px] transition
                                        ${active
                                    ? 'border-accent bg-accent-soft text-app'
                                    : 'border-zinc-700/80 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-900'
                            }`}
                        >
                            <span className="text-[11px] font-medium">{opt.label}</span>
                            <span className="text-[10px] text-zinc-500">{opt.hint}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
