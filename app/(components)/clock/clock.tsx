// components/Clock.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

type ClockProps = {
    use24Hour?: boolean;
    showSeconds?: boolean;
    timeZone?: string;
    tickIntervalMs?: number;
    className?: string;
    timeClassName?: string;  // controls size/font of the time
    dateClassName?: string;  // controls size/font of the date
};

function getTimeParts(date: Date, opts: ClockProps) {
    const { use24Hour, showSeconds, timeZone } = opts;

    const formatter = new Intl.DateTimeFormat([], {
        hour: 'numeric',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: !use24Hour,
        timeZone,
    });

    const parts = formatter.formatToParts(date); // hour, minute, second, dayPeriod, literals [web:540]

    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const secondPart = parts.find(p => p.type === 'second');
    const dayPeriodPart = parts.find(p => p.type === 'dayPeriod');

    // Remove leading zero from hour (e.g. "09" -> "9")
    const hour = hourPart ? String(parseInt(hourPart.value, 10)) : '';
    const minute = minutePart?.value ?? '';
    const second = secondPart?.value ?? '';
    const dayPeriod = dayPeriodPart?.value ?? '';

    return { hour, minute, second, dayPeriod };
}

export function Clock({
                          use24Hour = false,
                          showSeconds = false,
                          timeZone,
                          tickIntervalMs = 1000,
                          className = '',
                          timeClassName = 'text-7xl font-mono tracking-[0.15em] text-app',
                          dateClassName = 'mt-2 text-sm tracking-[0.18em] uppercase text-app/70',
                      }: ClockProps) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), tickIntervalMs);
        return () => clearInterval(id);
    }, [tickIntervalMs]);

    const { hour, minute, second, dayPeriod } = useMemo(
        () => getTimeParts(now, { use24Hour, showSeconds, timeZone }),
        [now, use24Hour, showSeconds, timeZone],
    );

    const dateLabel = useMemo(() => {
        const formatter = new Intl.DateTimeFormat([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            timeZone,
        });
        return formatter.format(now); // e.g. "Friday, December 5"
    }, [now, timeZone]);

    return (
        <div className={`inline-flex flex-col items-center justify-center ${className}`}>
            {/*Time*/}
            <div className="flex items-baseline justify-center border-b pb-3">
                {/*Time*/}
                <span className={timeClassName}>
                    {hour}:{minute}
                    {showSeconds && `:${second}`}
                </span>

                {/*AM/PM indicator*/}
                {dayPeriod && (
                    <span className="ml-1 text-lg uppercase tracking-[0.08em] text-app ">
                        {dayPeriod}
                    </span>
                )}
            </div>

            {/* Date */}
            <div className={`mt-2 flex items-baseline justify-center ${dateClassName}`}>
                {dateLabel}
            </div>
        </div>
    );
}
