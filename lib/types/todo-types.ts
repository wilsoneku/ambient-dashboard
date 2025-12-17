// Parsed shape from the quick-input bar
import type {Task} from "@/lib/types/db-types";

export type ParsedInput = {
    title: string;
    description?: string | null;
    due_at?: Date | null;
    location?: string | null;
    tags?: string[];
};

export type TodoTexts = {
    heading: string;
    emptyState: string;
    inputPlaceholder: string;
    addButton: string;
    leftLabel: string;
};

export type TodoInterfaceProps = {
    userId: string;
    initialTasks: Task[];
    texts?: Partial<TodoTexts>;
    className?: string;
};

