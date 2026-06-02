import {NextFunction, Request, Response} from "express";
import {
    createShift, getShiftsStats, getTop3UsersByShiftCount,
    readShiftById,
    readShifts,
    removeShift,
    updateShift,
} from "../services/shifts.services";
import {createShiftDto, dateDto, shiftQueryParamsDto, updateShiftDto} from "../schemas/shift.schemas";
import {targetIdDto} from "../schemas/other.schemas";
import {checkShiftOwnershipRepo} from "../repositories/shifts.repo";
import {ApiError} from "../middleware/ApiError.class";

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
        const userId = req.user!.id;
        const isOwner = await checkShiftOwnershipRepo(targetId, userId);
        if(!isOwner){
            return next(new ApiError(403, "FORBIDDEN", "Access denied. You are not the owner of this shift."));
        }
        const responseDto = await updateShift(dto, targetId);
        res.status(200).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteShift(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId: targetIdDto = req.params.id as string;
        const userId = req.user!.id;
        const isOwner = await checkShiftOwnershipRepo(targetId, userId);
        if(!isOwner){
            return next(new ApiError(403, "FORBIDDEN", "Access denied. You are not the owner of this shift."));
        }
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

export async function getTop3Users(req: Request, res: Response, next: NextFunction){
    try {
        const targetDateDto : dateDto = res.locals.query as dateDto;
        const stats = await getTop3UsersByShiftCount(targetDateDto);
        res.status(200).json(stats);
    } catch(err) {
        next(err);
    }
}