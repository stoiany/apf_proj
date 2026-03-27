import { z } from "zod";

export const targetIdSchema = z.uuid().optional();

export type targetIdDto = z.infer<typeof targetIdSchema>;