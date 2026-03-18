import { Request, Response } from "express";
import {
    createSwapRequest,
    readSwapRequestById,
    readSwapRequests,
    removeSwapRequest,
    updateSwapRequest,
} from "../services/swapRequests.services";
import {
    createSwapRequestDto,
    swapRequestResponseDto,
    updateSwapRequestDto,
} from "../schemas/swapRequest.schemas";

export function getSwapRequests(req: Request, res: Response) {
    const sortBy = req.query.sortBy as string;
    const sortDir = req.query.sortDir as string;
    const requesterId = req.query.requesterId as string;
    const targetUserId = req.query.targetUserId as string;
    const status = req.query.status as string;
    const dtoArray = readSwapRequests(
        sortBy,
        sortDir,
        requesterId,
        targetUserId,
        status,
    );
    res.status(200).json(dtoArray);
}

export function getSwapRequestById(req: Request, res: Response) {
    const targetId = req.params.id as string;
    const dto = readSwapRequestById(targetId);
    res.status(200).json(dto);
}

export function postSwapRequest(req: Request, res: Response) {
    const dto: createSwapRequestDto = req.body;
    const responseDto: swapRequestResponseDto = createSwapRequest(dto);
    res.status(201).json(responseDto);
}

export function putSwapRequest(req: Request, res: Response) {
    const targetId = req.params.id as string;
    const dto: updateSwapRequestDto = req.body;
    const responseDto: swapRequestResponseDto = updateSwapRequest(
        dto,
        targetId,
    );
    res.status(200).json(responseDto);
}

export function deleteSwapRequest(req: Request, res: Response) {
    const targetId: string = req.params.id as string;
    removeSwapRequest(targetId);
    res.status(204).send();
}
