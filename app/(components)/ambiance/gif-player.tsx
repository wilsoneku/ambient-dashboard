// app/(components)/ambiance/gif-player.tsx
'use client';

import Image from 'next/image';
import { useTheme, ThemeName } from '@/app/(components)/theme/theme-provider';

type GifConfig = {
    src: string;
    width: number;
    height: number;
    alt: string;
};

const GIF_BY_THEME: Record<ThemeName, GifConfig> = {
    default: {
        src: '/gifs/pixel-campfire.gif',
        width: 200,
        height: 200,
        alt: 'pixel campfire',
    },
    'pixel-campfire-1': {
        src: '/gifs/pixel-campfire-1.gif',
        width: 200,
        height: 200,
        alt: 'pixel campfire 1',
    },
    'pixel-campfire-2': {
        src: '/gifs/pixel-campfire-2.gif',
        width: 200,
        height: 200,
        alt: 'pixel campfire 2',
    },
};

type GifPlayerProps = {
    className?: string;
};

export function GifPlayer({ className = '' }: GifPlayerProps) {
    const { theme } = useTheme();

    const cfg = GIF_BY_THEME[theme] ?? GIF_BY_THEME.default;

    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden ${className}`}
        >
            <Image
                key={cfg.src}
                src={cfg.src}
                alt={cfg.alt}
                width={cfg.width}
                height={cfg.height}
                className="h-full w-full object-cover"
                priority
            />
        </div>
    );
}
