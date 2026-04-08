import {readUserByUsername} from "../repositories/users.repo";
import {
    checkSwapRequestCollision, createSwapRequestRepo, deleteSwapRequestRepo,
    readSwapRequestByIdRepo,
    readSwapRequestsRepo,
    updateSwapRequestRepo
} from "../repositories/swapRequests.repo";
import {
    createSwapRequestDto, swapReqQueryParamsDto,
    swapRequestResponseDto,
    updateSwapRequestDto,
} from "../schemas/swapRequest.schemas";
import { ApiError } from "../middleware/ApiError.class";
import {readShiftByIdRepo} from "../repositories/shifts.repo";

export type SwapStatus = "pending" | "approved" | "rejected";

export async function readSwapRequests(
    dto : swapReqQueryParamsDto
): Promise<swapRequestResponseDto[]> {
    return await readSwapRequestsRepo(dto);
}

export async function readSwapRequestById(targetId: string): Promise<swapRequestResponseDto> {
    const item = await readSwapRequestByIdRepo(targetId);
    if(!item) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Swap request with that ID was not found.",
        );
    }

    return item;
}

// export function createSwapRequest(
//     dto: createSwapRequestDto,
// ): swapRequestResponseDto {
//     const requester = users.find((u) => u.username === dto.requester);
//     const targetUser = users.find((u) => u.username === dto.targetUser);
//
//     if (!requester) {
//         throw new ApiError(
//             404,
//             "NOT_FOUND",
//             "Requester user with that username was not found.",
//         );
//     }
//
//     if (!targetUser) {
//         throw new ApiError(
//             404,
//             "NOT_FOUND",
//             "Target user with that username was not found.",
//         );
//     }
//
//     const shift = shifts.find((i) => i.id === dto.shiftId);
//     if (!shift) {
//         throw new ApiError(
//             404,
//             "NOT_FOUND",
//             "Shift with that ID was not found.",
//         );
//     }
//     if (shift.userId !== requester.id) {
//         throw new ApiError(
//             409,
//             "CONFLICT",
//             "Requester is not assigned to that shift.",
//         );
//     }
//
//     const isCollision = swapRequests.some(
//         (s) =>
//             s.requesterId === requester.id &&
//             s.targetUserId === targetUser.id &&
//             s.shiftId === shift.id,
//     );
//
//     if (isCollision) {
//         throw new ApiError(
//             409,
//             "CONFLICT",
//             "Swap request on this shift and target user already exists.",
//         );
//     }
//
//     const item = {
//         id: crypto.randomUUID(),
//         requesterId: requester ? requester.id : "User not found.",
//         targetUserId: targetUser ? targetUser.id : "User not found",
//         shiftId: dto.shiftId,
//         status: "pending",
//         createdAt: new Date().toISOString(),
//     };
//     swapRequests.push(item);
//
//     return {
//         id: item.id,
//         requester: dto.requester,
//         targetUser: dto.targetUser,
//         shiftId: dto.shiftId,
//         status: item.status as SwapStatus,
//         createdAt: item.createdAt,
//     };
// }

export async function createSwapRequest(dto : createSwapRequestDto): Promise<swapRequestResponseDto> {
    const requester = await readUserByUsername(dto.requester);
    if (!requester) {
        throw new ApiError(404, "NOT_FOUND", "Requester user with that username was not found.");
    }

    const targetUser = await readUserByUsername(dto.targetUser);
    if (!targetUser) {
        throw new ApiError(404, "NOT_FOUND", "Target user with that username was not found.");
    }

    const shift = await readShiftByIdRepo(dto.shiftId);
    if (!shift) {
        throw new ApiError(404, "NOT_FOUND", "Shift with that ID was not found.");
    }

    if (shift.username !== dto.requester) {
        throw new ApiError(409, "CONFLICT", "Requester is not assigned to that shift.");
    }

    const isCollision = await checkSwapRequestCollision(
        String(requester.id),
        String(targetUser.id),
        dto.shiftId
    );

    if (isCollision) {
        throw new ApiError(409, "CONFLICT", "Swap request on this shift and target user already exists.");
    }

    const createdReq = await createSwapRequestRepo({
        requesterId: String(requester.id),
        targetUserId: String(targetUser.id),
        shiftId: dto.shiftId,
    });

    return {
        id: createdReq.swapRequestId,
        requester: dto.requester,
        targetUser: dto.targetUser,
        shiftId: dto.shiftId,
        status: createdReq.status as swapRequestResponseDto["status"],
        createdAt: createdReq.createdAt,
    };
}

export async function updateSwapRequest(
    dto: updateSwapRequestDto,
    targetId: string,
): Promise<swapRequestResponseDto> {
    const existingReq = await readSwapRequestByIdRepo(targetId);
    if (!existingReq) {
        throw new ApiError(404, "NOT_FOUND", "Swap request with that ID was not found.");
    }

    const updateData: { requesterId?: string; targetUserId?: string; shiftId?: string; status?: string } = {};

    let finalRequesterUsername = existingReq.requester;
    let finalTargetUsername = existingReq.targetUser;

    if (dto.requester !== undefined) {
        const requesterUser = await readUserByUsername(dto.requester);
        if (!requesterUser) {
            throw new ApiError(404, "NOT_FOUND", "Requester user with that username was not found.");
        }
        updateData.requesterId = String(requesterUser.id);
        finalRequesterUsername = dto.requester;
    }

    if (dto.targetUser !== undefined) {
        const targetUser = await readUserByUsername(dto.targetUser);
        if (!targetUser) {
            throw new ApiError(404, "NOT_FOUND", "Target user with that username was not found.");
        }
        updateData.targetUserId = String(targetUser.id);
        finalTargetUsername = dto.targetUser;
    }

    if (dto.shiftId !== undefined || dto.requester !== undefined) {
        const shiftIdToCheck = dto.shiftId !== undefined ? dto.shiftId : existingReq.shiftId;

        const shift = await readShiftByIdRepo(shiftIdToCheck);
        if (!shift) {
            throw new ApiError(404, "NOT_FOUND", "Shift with that ID was not found.");
        }

        if (shift.username !== finalRequesterUsername) {
            throw new ApiError(409, "CONFLICT", "Requester is not assigned to that shift.");
        }

        if (dto.shiftId !== undefined) {
            updateData.shiftId = dto.shiftId;
        }
    }

    if (dto.status !== undefined) {
        updateData.status = dto.status;
    }

    await updateSwapRequestRepo(targetId, updateData);

    return {
        id: targetId,
        requester: finalRequesterUsername,
        targetUser: finalTargetUsername,
        shiftId: dto.shiftId !== undefined ? dto.shiftId : existingReq.shiftId,
        status: (dto.status !== undefined ? dto.status : existingReq.status) as swapRequestResponseDto["status"],
        createdAt: existingReq.createdAt,
    };
}

export async function removeSwapRequest(targetId: string): Promise<void> {
    const deletedCount = await deleteSwapRequestRepo(targetId);
    if (deletedCount === 0) {
        throw new ApiError(404, "NOT_FOUND", "Swap request with that ID was not found.");
    }
}
