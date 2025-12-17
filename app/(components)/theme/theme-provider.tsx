// app/(components)/theme/theme-provider.tsx
'use client';

import { createContext, useContext, useState } from 'react';

export type ThemeName = 'default' | 'pixel-campfire-1' | 'pixel-campfire-2';

type ThemeContextValue = {
    theme: ThemeName;
    setTheme(t: ThemeName): void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
                                  children,
                                  initialTheme,
                              }: {
    children: React.ReactNode;
    initialTheme: ThemeName;
}) {
    const [theme, setThemeState] = useState<ThemeName>(initialTheme);

    function applyTheme(next: ThemeName) {
        const root = document.documentElement;
        if (next === 'default') root.removeAttribute('data-theme');
        else root.setAttribute('data-theme', next);

        try {
            window.localStorage.setItem('theme', next);
            document.cookie = `theme=${next}; path=/; max-age=31536000`;
        } catch {
            // ignore
        }
    }

    function setTheme(next: ThemeName) {
        setThemeState(next);
        if (typeof document !== 'undefined') applyTheme(next);
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
