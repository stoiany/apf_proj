import { Router } from "express";
import { getScheduleById } from "../controllers/schedules.contorollers";
import {validateParams} from "../middleware/validation";
import {targetIdSchema} from "../schemas/other.schemas";

export const schedulesRouter = Router();

schedulesRouter.get("/:id", validateParams(targetIdSchema), getScheduleById);
