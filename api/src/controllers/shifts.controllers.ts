import {NextFunction, Request, Response} from "express";
import {
    createShift, getShiftsStats,
    readShiftById,
    readShifts,
    removeShift,
    updateShift,
} from "../services/shifts.services";
import {createShiftDto, shiftQueryParamsDto, updateShiftDto} from "../schemas/shift.schemas";
import {targetIdDto} from "../schemas/other.schemas";

export async function getShifts(req: Request, res: Response, next: NextFunction) {
    try {
        const dto: shiftQueryParamsDto = res.locals.query as shiftQueryParamsDto;
        const dtoArray = await readShifts(dto);
        res.status(200).json(dtoArray);
    } catch (err) {
        next(err);
    }
}

export async function getShiftById(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId: targetIdDto = req.params.id as string;
        const dto = await readShiftById(targetId);
        res.status(200).json(dto);
    } catch (err) {
        next(err);
    }
}

export async function postShift(req: Request, res: Response, next: NextFunction) {
    try {
        const dto: createShiftDto = req.body;
        const responseDto = await createShift(dto);
        res.status(201).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function putShift(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId: targetIdDto = req.params.id as string;
        const dto: updateShiftDto = req.body;
        const responseDto = await updateShift(dto, targetId);
        res.status(200).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteShift(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId: targetIdDto = req.params.id as string;
        await removeShift(targetId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
    try {
        const stats = await getShiftsStats();
        res.status(200).json(stats);
    } catch (err) {
        next(err);
    }
}