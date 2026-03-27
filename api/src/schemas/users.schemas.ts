import { z } from "zod";

const SortBySchema = ["username"] as const;
const SortDirSchema = ["asc", "desc"] as const;

export const userQueryParamsSchema = z.object({
    sortBy: z.enum(SortBySchema).optional(),
    sortDir: z.enum(SortDirSchema).optional(),
})

export type userQueryParamsDto = z.infer<typeof userQueryParamsSchema>;

export const createUserSchema = z.object({
    username: z.string().min(1).max(30),
});

export type createUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
    username: z.string().min(1).max(30),
});

export type updateUserDto = z.infer<typeof updateUserSchema>;

export const userResponseSchema = updateUserSchema.extend({
    id: z.string(),
});

export type userResponseDto = z.infer<typeof userResponseSchema>;
