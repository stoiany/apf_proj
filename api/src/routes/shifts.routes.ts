import { Router } from "express";
import {
    postShift,
    deleteShift,
    getShifts,
    getShiftById,
    putShift, getStats,
} from "../controllers/shifts.controllers";
import {validateBody, validateParams, validateQuery} from "../middleware/validation";
import {createShiftSchema, shiftQueryParamsSchema, updateShiftSchema} from "../schemas/shift.schemas";
import { targetIdSchema } from "../schemas/other.schemas";

export const shiftRouter = Router();

shiftRouter.get("/stats", getStats);
shiftRouter.get("/", validateQuery(shiftQueryParamsSchema), getShifts);
shiftRouter.get("/:id", validateParams(targetIdSchema), getShiftById);
shiftRouter.post("/", validateBody(createShiftSchema), postShift);
shiftRouter.put("/:id", validateBody(updateShiftSchema), validateParams(targetIdSchema), putShift);
shiftRouter.delete("/:id", validateParams(targetIdSchema), deleteShift);