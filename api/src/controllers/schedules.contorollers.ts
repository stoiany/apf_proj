import { Request, Response } from "express";
import { readScheduleById } from "../services/schedules.services";

export function getScheduleById(req: Request, res: Response) {
    const targetId = req.params.id as string;
    const dtoArray = readScheduleById(targetId);
    res.status(200).json(dtoArray);
}
