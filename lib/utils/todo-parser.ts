import { ParsedInput } from '@/lib/types/todo-types';

const WEEKDAYS = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
];

const WEEKDAY_ALIASES: Record<string, number> = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tues: 2,
    tuesday: 2,
    wed: 3,
    weds: 3,
    wednesday: 3,
    thu: 4,
    thur: 4,
    thurs: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
};

/**
 * Extended parser:
 *   "Title"
 *   "Title @ time"
 *   "Title @ date/time phrase"
 *   "Title @ date/time phrase @ location #tag1 #tag2"
 */
export function parseQuickInput(raw: string): ParsedInput {
    const trimmed = raw.trim();
    if (!trimmed) return { title: '' };

    const parts = trimmed
        .split('@')
        .map(p => p.trim())
        .filter(Boolean);

    if (parts.length === 1) {
        return { title: parts[0] };
    }

    if (parts.length === 2) {
        const [title, whenPart] = parts;
        const { due_at } = parseWhen(whenPart);
        return { title, due_at };
    }

    // Title @ when @ location/notes (may contain #tags)
    const [title, whenPart, ...rest] = parts;
    const restJoined = rest.join(' @ ').trim();

    const { due_at } = parseWhen(whenPart);
    const { textWithoutTags, tags } = extractTags(restJoined);

    return {
        title,
        due_at,
        location: textWithoutTags || null,
        description: textWithoutTags || null,
        tags: tags.length ? tags : undefined,
    };
}

/**
 * Parse natural-ish "when" phrases:
 *   "7pm"
 *   "tomorrow 9:30am"
 *   "next monday 8am"
 *   "saturday afternoon"
 *   "2025-12-25 10:00"
 */
function parseWhen(input: string): { due_at: Date | null } {
    const raw = input.trim();
    if (!raw) return { due_at: null };

    const lower = raw.toLowerCase();

    // Try a direct Date parse first for full dates like "2025-12-25 10:00"
    const direct = new Date(raw);
    if (!Number.isNaN(direct.getTime())) {
        return { due_at: direct };
    }

    const now = new Date();
    let baseDate = new Date(now);

    // Relative day keywords
    if (/\btomorrow\b|tmrw/.test(lower)) {
        baseDate.setDate(baseDate.getDate() + 1);
    } else if (/\btoday\b/.test(lower)) {
        // already today
    } else if (/\bnext week\b/.test(lower)) {
        baseDate.setDate(baseDate.getDate() + 7);
    } else {
        // weekday names, e.g. "next monday", "monday 9am"
        const weekdayMatch = Object.keys(WEEKDAY_ALIASES).find(w =>
            lower.includes(w),
        );
        if (weekdayMatch) {
            const targetDow = WEEKDAY_ALIASES[weekdayMatch];
            baseDate = nextWeekday(now, targetDow);
        }
    }

    // Time of day keywords
    let defaultHour: number | null = null;
    if (/\bmorning\b/.test(lower)) defaultHour = 9;
    else if (/\bafternoon\b/.test(lower)) defaultHour = 14;
    else if (/\bevening\b/.test(lower) || /\btonight\b/.test(lower))
        defaultHour = 19;

    // Explicit time like "7pm", "09:30", "21:00", "9:15 am"
    const timeMatch =
        lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/) || null;

    let hour = defaultHour ?? 9;
    let minute = 0;

    if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const ampm = timeMatch[3];

        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;

        hour = h;
        minute = m;
    }

    const due = new Date(baseDate);
    due.setHours(hour, minute, 0, 0);

    // If "today" and time already passed, bump to tomorrow to avoid past-times
    if (due.getTime() <= now.getTime() && !/tomorrow|next/.test(lower)) {
        due.setDate(due.getDate() + 1);
    }

    return { due_at: due };
}

/**
 * Find the next occurrence of a weekday (including today+7 if already passed).
 */
function nextWeekday(from: Date, targetDow: number): Date {
    const result = new Date(from);
    const currentDow = result.getDay();
    let diff = targetDow - currentDow;
    if (diff <= 0) diff += 7;
    result.setDate(result.getDate() + diff);
    return result;
}

/**
 * Extract #tags from a string and return cleaned text + array of tags.
 * "Pasadena #errands #night" -> { textWithoutTags: "Pasadena", tags: ["errands", "night"] }
 */
function extractTags(input: string): { textWithoutTags: string; tags: string[] } {
    if (!input) return { textWithoutTags: '', tags: [] };

    const words = input.split(/\s+/);
    const tags: string[] = [];
    const kept: string[] = [];

    for (const w of words) {
        if (w.startsWith('#') && w.length > 1) {
            tags.push(w.slice(1));
        } else {
            kept.push(w);
        }
    }

    return {
        textWithoutTags: kept.join(' ').trim(),
        tags,
    };
}
