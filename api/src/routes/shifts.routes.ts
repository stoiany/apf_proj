import {Router} from "express";
import {postShift, deleteShift, getShifts, getShiftById, putShift} from "../controllers/shifts.controllers";

export const shiftRouter = Router();

shiftRouter.get("/", getShifts);
shiftRouter.get("/:id", getShiftById);
shiftRouter.post("/", postShift);
shiftRouter.put("/:id", putShift);
shiftRouter.delete("/:id", deleteShift);