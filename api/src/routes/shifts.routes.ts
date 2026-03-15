import {Router} from "express";
import {postShift, deleteShift, getShifts, getShiftById, putShift} from "../controllers/shifts.controllers";
import {validate} from "../middleware/validation";
import {createShiftSchema, updateShiftSchema} from "../schemas/shift.schemas";

export const shiftRouter = Router();

shiftRouter.get("/", getShifts);
shiftRouter.get("/:id", getShiftById);
shiftRouter.post("/", validate(createShiftSchema), postShift);
shiftRouter.put("/:id", validate(updateShiftSchema), putShift);
shiftRouter.delete("/:id", deleteShift);