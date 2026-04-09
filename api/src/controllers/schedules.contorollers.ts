import {NextFunction, Request, Response} from "express";
import { readScheduleById } from "../services/schedules.services";
import {targetIdDto} from "../schemas/other.schemas";

export async function getScheduleById(req: Request, res: Response, next: NextFunction) {
    const targetId: targetIdDto = req.params.id as string;
    const dtoArray = await readScheduleById(targetId);
    res.status(200).json(dtoArray);
}
