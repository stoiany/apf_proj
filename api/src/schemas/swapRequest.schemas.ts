import { z } from "zod";

const SortBySchema = ["requester", "createdAt", "targetUser"] as const;
const SortDirSchema = ["asc", "desc"] as const;
const statusFilterSchema = ["pending", "approved", "rejected"] as const;

export const swapReqQueryParamsSchema = z.object({
    sortBy: z.enum(SortBySchema).optional(),
    sortDir: z.enum(SortDirSchema).optional(),
    status: z.enum(statusFilterSchema).optional(),
    requesterId: z.uuid().optional(),
    targetUserId: z.uuid().optional(),
})

export type swapReqQueryParamsDto = z.infer<typeof swapReqQueryParamsSchema>;

export const createSwapRequestSchema = z.object({
    requester: z.string().min(1).max(30),
    targetUser: z.string().min(1).max(30),
    shiftId: z.uuid(),
});

export type createSwapRequestDto = z.infer<typeof createSwapRequestSchema>;

export const updateSwapRequestSchema = z.object({
    requester: z.string().min(1).max(30),
    targetUser: z.string().min(1).max(30),
    shiftId: z.uuid(),
    status: z.enum(
        ["pending", "approved", "rejected"],
        "Status must be one of those: pending, approved, rejected.",
    ),
});

export type updateSwapRequestDto = z.infer<typeof updateSwapRequestSchema>;

export const swapRequestResponseSchema = updateSwapRequestSchema.extend({
    id: z.string(),
    createdAt: z.string(),
});

export type swapRequestResponseDto = z.infer<typeof swapRequestResponseSchema>;
