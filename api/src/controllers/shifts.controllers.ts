import {Request, Response} from "express";
import {createShift, readShiftById, readShifts, removeShift, updateShift} from "../services/shifts.services";
import {createShiftDto, updateShiftDto} from "../schemas/shift.schemas";

export function getShifts(req: Request, res: Response){
    const dtoArray = readShifts();
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