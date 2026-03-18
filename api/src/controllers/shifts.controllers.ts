import {Request, Response} from "express";
import {createShift, readShiftById, readShifts, removeShift, updateShift} from "../services/shifts.services";
import {createShiftDto, updateShiftDto} from "../schemas/shift.schemas";

export function getShifts(req: Request, res: Response){
    const sortBy = req.query.sortBy as string;
    const sortDir = req.query.sortDir as string;
    const status = req.query.status as string;
    const userId = req.query.userId as string;
    const dtoArray = readShifts(sortBy, sortDir, status, userId);
    res.status(200).json(dtoArray);
}

export function getShiftById(req: Request, res: Response){
    const dto = readShiftById(req);
    res.status(200).json(dto);
}

export function postShift(req: Request, res: Response){
    const dto : createShiftDto = req.body;
    const responseDto = createShift(dto);
    res.status(201).json(responseDto);
}

export function putShift(req: Request, res: Response){
    const targetId = req.params.id as string;
    const dto : updateShiftDto = req.body;
    const responseDto = updateShift(dto, targetId);
    res.status(200).json(responseDto);
}

export function deleteShift(req: Request, res: Response){
    removeShift(req);
    res.status(204).send();
}