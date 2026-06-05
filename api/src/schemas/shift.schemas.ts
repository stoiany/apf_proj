import { z } from "zod";

const SortBySchema = ["date", "createdAt"] as const;
const SortDirSchema = ["asc", "desc"] as const;
const statusFilterSchema = ["scheduled", "completed", "missed", "canceled"] as const;

export const shiftQueryParamsSchema = z.object({
    sortBy: z.enum(SortBySchema).optional(),
    sortDir: z.enum(SortDirSchema).optional(),
    status: z.enum(statusFilterSchema).optional(),
    userId: z.uuid().optional(),
})

export type shiftQueryParamsDto = z.infer<typeof shiftQueryParamsSchema>;

export const createShiftSchema = z.object({
    username: z.string().min(1).max(30),
    date: z.iso.date("Date must be a real date in YYYY-MM-DD format"),
    time: z.enum(
        ["morning", "day", "evening"],
        "Time must be one of those: morning, day, evening.",
    ),
    status: z.enum(
        ["scheduled", "completed", "missed"],
        "Status must be one of those: scheduled, completed, missed.",
    ),
    comment: z.string().max(80).default(""),
});

export type createShiftDto = z.infer<typeof createShiftSchema>;

export const updateShiftSchema = z.object({
    username: z.string().min(1).max(30).optional(),
    date: z.iso
        .date("Date must be a real date in YYYY-MM-DD format")
        .optional(),
    time: z
        .enum(
            ["morning", "day", "evening"],
            "Time must be one of those: morning, day, evening.",
        )
        .optional(),
    status: z
        .enum(
            ["scheduled", "completed", "missed", "canceled"],
            "Status must be one of those: scheduled, completed, missed, canceled.",
        )
        .optional(),
    comment: z.string().max(80).optional(),
});

export type updateShiftDto = z.infer<typeof updateShiftSchema>;

export const shiftResponseSchema = createShiftSchema.extend({
    id: z.string(),
    createdAt: z.string(),
});

export type shiftResponseDto = z.infer<typeof shiftResponseSchema>;

export type shiftResponseRow = {
    id: number | string,
    username: string,
    date: string,
    time: "morning" | "day" | "evening",
    status: "scheduled" | "completed" | "missed" | "canceled",
    comment: string | null,
    createdAt: string,
}

export const dateSchema = z.object({
    date: z.iso.date("Date must be a real date in YYYY-MM-DD format"),
});

export type dateDto = z.infer<typeof dateSchema>;

export const timeSchema = z.object({
    time: z.enum(
    ["morning", "day", "evening"],
    "Time must be one of those: morning, day, evening."
    )
});

export type timeDto = z.infer<typeof timeSchema>