'use client';

import { useState, useTransition } from 'react';
import {
    signUp,
    signInEmail,
    signInUsername,
    signOut,
} from '@/lib/actions/auth-actions';
import { LogIn, LogOut, UserPlus, X } from 'lucide-react';

type Mode = 'signin-email' | 'signin-username' | 'signup';

type AuthDialogProps = {
    open: boolean;
    onClose(): void;
    userName?: string | null;
};

export function AuthDialog({ open, onClose, userName }: AuthDialogProps) {
    const [mode, setMode] = useState<Mode>('signin-email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const isLoggedIn = !!userName

    if (!open) return null;

    function handleLogout() {
        startTransition(async () => {
            await signOut();
            window.location.reload();
        });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            try {
                if (mode === 'signup') {
                    const res = await signUp(
                        email,
                        password,
                        name || userUsername,
                        userUsername,
                    );
                    if (!res.ok) {
                        setError(res.message ?? 'Failed to sign up');
                        return;
                    }
                    window.location.href = res.redirect ?? '/';
                    return;
                }

                if (mode === 'signin-email') {
                    const res = await signInEmail(email, password);
                    if (!res.ok) {
                        setError(res.message ?? 'Invalid email or password');
                        return;
                    }
                    window.location.href = res.redirect ?? '/';
                    return;
                }

                if (mode === 'signin-username') {
                    const res = await signInUsername(userUsername, password);
                    if (!res.ok) {
                        setError(res.message ?? 'Invalid username or password');
                        return;
                    }
                    window.location.href = res.redirect ?? '/';
                }
            } catch {
                setError('Something went wrong. Please try again.');
            }
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-4 text-xs text-zinc-200 shadow-xl shadow-black/70">
                {/* Header */}
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-zinc-100">
              {isLoggedIn ? 'Account' : 'Welcome back'}
            </span>
                        <span className="text-[10px] text-zinc-500">
              {isLoggedIn ? (userName) : 'Sign in to sync your space'}
            </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:bg-zinc-800/80"
                        aria-label="Close auth"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                {isLoggedIn ? (
                    <div className="mt-1 flex justify-end">
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
                        >
                            <LogOut className="h-3 w-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mode pills */}
                        <div className="mb-2 flex gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/60 p-0.5">
                            <button
                                type="button"
                                onClick={() => setMode('signin-email')}
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    mode === 'signin-email'
                                        ? 'bg-zinc-100 text-zinc-900'
                                        : 'text-zinc-300 hover:text-white'
                                }`}
                            >
                                Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('signin-username')}
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    mode === 'signin-username'
                                        ? 'bg-zinc-100 text-zinc-900'
                                        : 'text-zinc-300 hover:text-white'
                                }`}
                            >
                                Username
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('signup')}
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                    mode === 'signup'
                                        ? 'bg-emerald-400 text-emerald-950'
                                        : 'text-emerald-300 hover:text-emerald-200'
                                }`}
                            >
                                Sign up
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                            {mode === 'signup' && (
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full border-b border-zinc-600 bg-transparent px-0 py-0.5 text-[11px] text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                                    disabled={isPending}
                                />
                            )}

                            {(mode === 'signin-email' || mode === 'signup') && (
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full border-b border-zinc-600 bg-transparent px-0 py-0.5 text-[11px] text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                                    disabled={isPending}
                                />
                            )}

                            {(mode === 'signin-username' || mode === 'signup') && (
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={userUsername}
                                    onChange={e => setUserUsername(e.target.value)}
                                    className="w-full border-b border-zinc-600 bg-transparent px-0 py-0.5 text-[11px] text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                                    disabled={isPending}
                                />
                            )}

                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full border-b border-zinc-600 bg-transparent px-0 py-0.5 text-[11px] text-white placeholder:text-zinc-500 focus:border-emerald-400 focus:outline-none"
                                disabled={isPending}
                            />

                            {error && (
                                <p className="pt-0.5 text-[10px] text-red-400">{error}</p>
                            )}

                            <div className="mt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-[10px] text-zinc-500 hover:text-zinc-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 px-3 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-60"
                                >
                                    {mode === 'signup' ? (
                                        <>
                                            <UserPlus className="h-3 w-3" />
                                            <span>Create account</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-3 w-3" />
                                            <span>Sign in</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
