import { z } from "zod";

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
