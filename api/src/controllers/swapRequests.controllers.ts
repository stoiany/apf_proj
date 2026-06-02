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
import {ApiError} from "../middleware/ApiError.class";
import {checkIsSwapParticipantRepo, checkIsSwapRequesterRepo} from "../repositories/swapRequests.repo";

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
        // const currentUserId = req.user!.id;
        // if (req.body.requesterId !== currentUserId) {
        //     return next(new ApiError(403, "FORBIDDEN", "You can only create swap requests for yourself."));
        // }
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
        const currentUserId = req.user!.id;
        const isParticipant = await checkIsSwapParticipantRepo(targetId, currentUserId);
        if (!isParticipant) {
            return next(new ApiError(403, "FORBIDDEN", "Access denied. You are not a participant of this swap request."));
        }
        const responseDto: swapRequestResponseDto = await updateSwapRequest(dto, targetId);
        res.status(200).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteSwapRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        const currentUserId = req.user!.id;
        const isRequester = await checkIsSwapRequesterRepo(targetId, currentUserId);
        if (!isRequester) {
            return next(new ApiError(403, "FORBIDDEN", "Access denied. Only the requester can delete this swap request."));
        }
        await removeSwapRequest(targetId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
