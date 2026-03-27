import { Request, Response } from "express";
import { readScheduleById } from "../services/schedules.services";
import {targetIdDto} from "../schemas/other.schemas";

export function getScheduleById(req: Request, res: Response) {
    const targetId : targetIdDto = req.params.id as string;
    const dtoArray = readScheduleById(targetId);
    res.status(200).json(dtoArray);
}
