export interface Shift {
    id?: string;
    date: string;
    time: "morning" | "day" | "evening";
    username: string;
    status: "scheduled" | "completed" | "missed";
    comment?: string;
}