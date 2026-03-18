import {Router} from "express";
import {getScheduleById} from "../controllers/schedules.contorollers";

export const schedulesRouter = Router();

schedulesRouter.get("/:id", getScheduleById);