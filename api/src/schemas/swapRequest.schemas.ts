import { z } from "zod";

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
