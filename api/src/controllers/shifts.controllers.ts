import {Request, Response} from "express";
import {createShift, readShiftById, readShifts, removeShift, updateShift} from "../services/shifts.services";

export function getShifts(req: Request, res: Response){
    const dtoArray = readShifts();
    res.status(200).json(dtoArray);
}

export function getShiftById(req: Request, res: Response){
    const dto = readShiftById(req);
    res.status(200).json(dto);
}

export function postShift(req: Request, res: Response){
    const dto = createShift(req);
    res.status(201).json(dto);
}

export function putShift(req: Request, res: Response){
    const dto = updateShift(req);
    res.status(200).json(dto);
}

export function deleteShift(req: Request, res: Response){
    removeShift(req);
    res.status(204).send();
}