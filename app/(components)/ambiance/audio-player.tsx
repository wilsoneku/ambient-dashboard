// app/(components)/ambiance/audio-player.tsx
'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import ReactPlayer from 'react-player';
import {Play, Pause, RotateCcw, RotateCw, ListMusic, SkipBack, SkipForward, X, Trash2, Plus} from 'lucide-react';
import {Portal} from "@/app/(components)/shared/portal";

type AudioPlayerProps = {
    defaultTrack: QueueItem
    className?: string;
};

type QueueItem = { id: string; url: string; label?: string };

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';

    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
        // HH:MM:SS
        return `${hours.toString().padStart(2, '0')}:${mins
            .toString()
            .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // MM:SS
    return `${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
}

export function AudioPlayer({ defaultTrack, className = '' }: AudioPlayerProps) {
    const mediaRef = useRef<HTMLMediaElement | null>(null);
    const queueButtonRef = useRef<HTMLButtonElement | null>(null);
    const [queuePos, setQueuePos] = useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [playedSeconds, setPlayedSeconds] = useState(0);
    const [hoverSeconds, setHoverSeconds] = useState<number | null>(null);
    const [hoverRatio, setHoverRatio] = useState<number | null>(null);

    // Queue
    const [queue, setQueue] = useState<QueueItem[]>([defaultTrack]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const current = queue[currentIndex] ?? queue[0];

    const [showQueue, setShowQueue] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newLabel, setNewLabel] = useState('');

    const togglePlay = useCallback(() => {
        setIsPlaying(p => !p);
    }, []);

    function seekTo(newTime: number) {
        if (!mediaRef.current) return;
        const clamped = Math.min(Math.max(newTime, 0), duration || newTime);
        mediaRef.current.currentTime = clamped;
        setPlayedSeconds(clamped);
    }

    function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
        const newTime = Number(e.target.value); // seconds
        seekTo(newTime);
    }

    function handleSkip(delta: number) {
        seekTo(playedSeconds + delta);
    }

    function handleHover(e: React.MouseEvent<HTMLInputElement>) {
        if (!duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const ratio = Math.min(Math.max(x / rect.width, 0), 1);
        setHoverRatio(ratio);
        setHoverSeconds(ratio * duration);
    }

    function handleHoverEnd() {
        setHoverRatio(null);
        setHoverSeconds(null);
    }

    // Queue handlers
    function openQueue() {
        if (!queueButtonRef.current) {
            setShowQueue(true);
            return;
        }
        const rect = queueButtonRef.current.getBoundingClientRect();
        const GAP = 10; // space between button and bubble
        setQueuePos({
            top: rect.top - GAP,                    // anchor at button top
            left: rect.left + rect.width / 2,       // center horizontally
        });
        setShowQueue(true);
    }

    function handleAddToQueue(e: React.FormEvent) {
        e.preventDefault();
        const url = newUrl.trim();
        if (!url) return;
        setQueue(prev => [
            ...prev,
            { id: crypto.randomUUID(), url, label: newLabel.trim() || url },
        ]);
        setNewUrl('');
        setNewLabel('');
    }

    function handleRemoveFromQueue(id: string) {
        setQueue(prev => {
            const idx = prev.findIndex(item => item.id === id);
            const next = prev.filter(item => item.id !== id);
            if (next.length === 0) return prev; // keep at least one
            if (idx === currentIndex) {
                // if we removed current track, move to 0
                setCurrentIndex(0);
            } else if (idx < currentIndex) {
                setCurrentIndex(i => Math.max(i - 1, 0));
            }
            return next;
        });
    }

    function handleSelectTrack(index: number) {
        setCurrentIndex(index);
        setIsPlaying(true);
        setPlayedSeconds(0);
        seekTo(0);
    }

    // Global Space key toggles play/pause
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement | null;
            const isTyping =
                target &&
                (target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable);

            if (isTyping) return;

            if (e.code === 'Space') {
                e.preventDefault(); // avoid page scroll [web:685]
                togglePlay();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [togglePlay]);

    return (
        <div className={className}>
            {/* Outer layout: column on mobile, row on md+ */}
            <div className="group flex flex-col gap-2">
                {/* Timeline + Time */}
                <div className="relative flex flex-col w-full items-center
                                opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                >
                    {/* Timeline */}
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={playedSeconds}
                        onChange={handleSeek}
                        onMouseMove={handleHover}
                        onMouseLeave={handleHoverEnd}
                        className="audio-slider w-full cursor-pointer appearance-none"
                    />

                    {/* Hover tooltip */}
                    {hoverRatio !== null && hoverSeconds !== null && (
                        <div
                            className="pointer-events-none absolute -top-7"
                            style={{
                                left: `calc(${hoverRatio * 100}% - 1.5rem)`, // 1.5rem ≈ half-tooltip width
                            }}
                        >
                            <div className="rounded-md bg-card/90 px-2 py-0.5 text-[11px] font-medium text-app">
                                {formatTime(hoverSeconds)}
                            </div>
                        </div>
                    )}

                    {/* Time */}
                    <span className="text-[11px] tabular-nums tracking-[0.08em] text-app">
                        {formatTime(playedSeconds)} / {formatTime(duration)}
                    </span>
                </div>

                {/* Media Controls */}
                <div className="relative flex items-center justify-center
                                opacity-30 group-hover:opacity-100 transition-opacity duration-300"
                >
                    {/* Left controls: queue */}
                    <div className="absolute left-0 flex items-center gap-2">
                        {/* Queue Button */}
                        <button
                            ref={queueButtonRef}
                            type="button"
                            onClick={openQueue}
                            className="hidden h-8 w-8 items-center justify-center rounded-full
                                       text-app/80 hover:bg-accent-soft hover:text-accent md:flex"
                        >
                            <ListMusic className="size-5" />
                        </button>
                    </div>

                    {/* Center: Play / Pause, always centered */}
                    <div className="flex gap-5 items-center justify-center">
                        {/* Back 10s */}
                        <button
                            type="button"
                            onClick={() => handleSkip(-10)}
                            className="flex size-5 items-center justify-center rounded-full text-xs
                                       text-app hover:bg-accent-soft hover:text-accent"
                            aria-label="Back 10 seconds"
                        >
                            <RotateCcw className="size-5" />
                        </button>

                        {/* Prev Track */}
                        <button
                            type="button"
                            onClick={() => {
                                if (queue.length <= 1) return;
                                setCurrentIndex(i => (i - 1 + queue.length) % queue.length);
                                setIsPlaying(true);
                                setPlayedSeconds(0);
                                seekTo(0);
                            }}
                            className="flex size-5 items-center justify-center rounded-full text-xs
                                       text-app hover:bg-accent-soft hover:text-accent"
                            aria-label="Previous track"
                        >
                            <SkipBack className="size-5" />
                        </button>

                        {/* Play / Pause */}
                        <button
                            type="button"
                            onClick={() => setIsPlaying(p => !p)}
                            className="flex size-8 items-center justify-center rounded-full
                                       text-sm text-app hover:bg-accent-soft hover:text-accent"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? <Pause className="size-8" /> : <Play className="size-8" />}
                        </button>

                        {/* Next Track */}
                        <button
                            type="button"
                            onClick={() => {
                                if (queue.length <= 1) return;
                                setCurrentIndex(i => (i + 1) % queue.length);
                                setIsPlaying(true);
                                setPlayedSeconds(0);
                                seekTo(0);
                            }}
                            className="flex size-5 items-center justify-center rounded-full text-xs
                                       text-app hover:bg-accent-soft hover:text-accent"
                            aria-label="Next track"
                        >
                            <SkipForward className="size-5" />
                        </button>

                        {/* Forward 10s */}
                        <button
                            type="button"
                            onClick={() => handleSkip(10)}
                            className="flex size-5 items-center justify-center rounded-full text-xs
                                       text-app hover:bg-accent-soft hover:text-accent"
                            aria-label="Forward 10 seconds"
                        >
                            <RotateCw className="size-5" />
                        </button>
                    </div>

                    {/* Right controls: (none) */}
                    <div className="absolute right-0 flex items-center gap-2">

                    </div>
                </div>

            </div>

            {/* Hidden player (audio only) */}
            <div className="pointer-events-none fixed inset-0 opacity-0" aria-hidden="true">
                <ReactPlayer
                    src={current.url}
                    playing={isPlaying}
                    controls={false}
                    width="0"
                    height="0"
                    style={{ display: 'none' }}
                    onTimeUpdate={event => {
                        const el = event.currentTarget;
                        mediaRef.current = el;
                        setPlayedSeconds(el.currentTime || 0);
                    }}
                    onDurationChange={event => {
                        const el = event.currentTarget;
                        mediaRef.current = el;
                        setDuration(el.duration || 0);
                    }}
                />
            </div>

            {/* Queue popup via Portal */}
            {showQueue && (
                <Portal>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowQueue(false)}
                    >
                        <div
                            className="relative z-50 w-64 -translate-x-1/2 translate-y-[-100%]
                                       rounded-2xl border border-accent-soft bg-card p-3 text-app
                                       shadow-xl shadow-black/60 animate-bubble-up"
                            style={{ top: queuePos.top, left: queuePos.left }}
                            onClick={e => e.stopPropagation()}
                        >

                            <header className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-app/70">
                                    Queue
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowQueue(false)}
                                    className="flex h-6 w-6 items-center justify-center rounded-full text-app/60
                                               hover:bg-accent-soft hover:text-app"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </header>

                            <ul className="mb-3 max-h-40 space-y-1 overflow-y-auto text-xs">
                                {queue.map((item, index) => (
                                    <li
                                        key={item.id}
                                        className={`flex items-center justify-between rounded-md px-2 py-1 text-app/80
                                                    ${index === currentIndex
                                                    ? 'bg-accent-soft/60 text-app'
                                                    : 'hover:bg-accent-soft/40'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleSelectTrack(index)}
                                            className="flex-1 truncate text-left"
                                        >
                                            {item.label || item.url}
                                        </button>
                                        {item.id !== 'initial' && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFromQueue(item.id)}
                                                className="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px]
                                                           text-app/60 hover:bg-red-500/20 hover:text-red-200"
                                                aria-label="Remove from queue"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <form
                                onSubmit={handleAddToQueue}
                                className="flex flex-col gap-2 border-t border-accent-soft/40 pt-2"
                            >
                                <div className="flex flex-col gap-1">
                                    <input
                                        value={newUrl}
                                        onChange={e => setNewUrl(e.target.value)}
                                        placeholder="YouTube URL"
                                        className="w-full rounded-md bg-transparent px-2 py-1 text-[11px]
                                                   text-app placeholder:text-app/40 outline-none
                                                   ring-1 ring-accent-soft/40 focus:ring-accent"
                                    />
                                    <input
                                        value={newLabel}
                                        onChange={e => setNewLabel(e.target.value)}
                                        placeholder="Label (optional)"
                                        className="w-full rounded-md bg-transparent px-2 py-1 text-[11px]
                                                   text-app placeholder:text-app/40 outline-none
                                                   ring-1 ring-accent-soft/30 focus:ring-accent-soft"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newUrl.trim()}
                                    className="inline-flex items-center justify-center gap-1 rounded-md bg-accent-soft
                                               px-3 py-1 text-[11px] font-medium text-app hover:bg-accent
                                               disabled:opacity-40"
                                >
                                    <Plus className="h-3 w-3" />
                                    <span>Add to queue</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}
