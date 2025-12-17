import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppMenu } from '@/app/(components)/menu/app-menu';
import { auth } from '@/lib/auth';
import { headers, cookies } from 'next/headers';
import { ThemeProvider } from '@/app/(components)/theme/theme-provider';
import type { ThemeName } from '@/app/(components)/theme/theme-provider';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Ambient Dashboard',
    description: 'chill out',
};

export default async function RootLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const userName = session?.user.name ?? null;

    const cookieStore = await cookies();
    const themeCookie = cookieStore.get('theme')?.value as ThemeName | undefined;

    const initialTheme: ThemeName =
        themeCookie === 'pixel-campfire-1' || themeCookie === 'pixel-campfire-2'
            ? themeCookie
            : 'default';

    return (
        <html
            lang="en"
            data-theme={initialTheme === 'default' ? undefined : initialTheme}
        >
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white`}
        >
        <ThemeProvider initialTheme={initialTheme}>
            <div className="pointer-events-none fixed inset-0 z-50">
                <div className="pointer-events-auto absolute right-4 top-4">
                    <AppMenu userName={userName} />
                </div>
            </div>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
