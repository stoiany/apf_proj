import {NextFunction, Request, Response} from "express";
import {
    createSwapRequest,
    readSwapRequestById,
    readSwapRequests,
    removeSwapRequest,
    updateSwapRequest,
} from "../services/swapRequests.services";
import {
    createSwapRequestDto, swapReqQueryParamsDto,
    swapRequestResponseDto,
    updateSwapRequestDto,
} from "../schemas/swapRequest.schemas";
import {targetIdDto} from "../schemas/other.schemas";

export async function getSwapRequests(req: Request, res: Response, next: NextFunction) {
    try {
        const dto : swapReqQueryParamsDto = res.locals.query as swapReqQueryParamsDto;
        const dtoArray = await readSwapRequests(dto);
        res.status(200).json(dtoArray);
    } catch (err) {
        next(err);
    }
}

export async function getSwapRequestById(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        const dto = await readSwapRequestById(targetId);
        res.status(200).json(dto);
    } catch (err) {
        next(err);
    }
}

export async function postSwapRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const dto : createSwapRequestDto = req.body;
        const responseDto: swapRequestResponseDto = await createSwapRequest(dto);
        res.status(201).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function putSwapRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        const dto : updateSwapRequestDto = req.body;
        const responseDto: swapRequestResponseDto = await updateSwapRequest(dto, targetId);
        res.status(200).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteSwapRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        await removeSwapRequest(targetId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
