import { users } from "../repositories/users.repo";
import { swapRequests } from "../repositories/swapRequests.repo";
import {
    createSwapRequestDto, swapReqQueryParamsDto,
    swapRequestResponseDto,
    updateSwapRequestDto,
} from "../schemas/swapRequest.schemas";
import { ApiError } from "../middleware/ApiError.class";
import { shifts } from "../repositories/shifts.repo";

export type SwapStatus = "pending" | "approved" | "rejected";

export function readSwapRequests(
    dto : swapReqQueryParamsDto
): swapRequestResponseDto[] {
    let processedArray = swapRequests;

    if (dto.requesterId) {
        processedArray = processedArray.filter(
            (s) => s.requesterId === dto.requesterId,
        );
    }
    if (dto.targetUserId) {
        processedArray = processedArray.filter(
            (s) => s.targetUserId === dto.targetUserId,
        );
    }
    if (dto.status) {
        processedArray = processedArray.filter((s) => s.status === dto.status);
    }

    const mappedArray = processedArray.map((item) => {
        const requester = users.find((u) => item.requesterId === u.id);
        const targetUser = users.find((u) => item.targetUserId === u.id);
        return {
            id: item.id,
            requester: requester ? requester.username : "User not found.",
            targetUser: targetUser ? targetUser.username : "User not found.",
            shiftId: item.shiftId,
            status: item.status as SwapStatus,
            createdAt: item.createdAt,
        };
    });

    if (!dto.sortBy) {
        return mappedArray;
    }

    mappedArray.sort((a, b) => {
        let comparison: number;

        const valueA = a[dto.sortBy as keyof typeof a];
        const valueB = b[dto.sortBy as keyof typeof b];

        if (dto.sortBy === "createdAt") {
            const timeA = new Date(valueA as string).getTime();
            const timeB = new Date(valueB as string).getTime();
            comparison = timeA - timeB;
        } else {
            const strA = String(valueA || "");
            const strB = String(valueB || "");
            comparison = strA.localeCompare(strB);
        }

        if (dto.sortDir === "desc") {
            return comparison * -1;
        }

        return comparison;
    });

    return mappedArray;
}

export function readSwapRequestById(targetId: string): swapRequestResponseDto {
    const item = swapRequests.find((i) => i.id === targetId);

    if (!item) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Swap request with that ID was not found.",
        );
    }

    const requester = users.find((u) => u.id === item.requesterId);
    const targetUser = users.find((u) => u.id === item.targetUserId);
    return {
        id: item.id,
        requester: requester ? requester.username : "User not found.",
        targetUser: targetUser ? targetUser.username : "User not found.",
        shiftId: item.shiftId,
        status: item.status as SwapStatus,
        createdAt: item.createdAt,
    };
}

export function createSwapRequest(
    dto: createSwapRequestDto,
): swapRequestResponseDto {
    const requester = users.find((u) => u.username === dto.requester);
    const targetUser = users.find((u) => u.username === dto.targetUser);

    if (!requester) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Requester user with that username was not found.",
        );
    }

    if (!targetUser) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Target user with that username was not found.",
        );
    }

    const shift = shifts.find((i) => i.id === dto.shiftId);
    if (!shift) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Shift with that ID was not found.",
        );
    }
    if (shift.userId !== requester.id) {
        throw new ApiError(
            409,
            "CONFLICT",
            "Requester is not assigned to that shift.",
        );
    }

    const isCollision = swapRequests.some(
        (s) =>
            s.requesterId === requester.id &&
            s.targetUserId === targetUser.id &&
            s.shiftId === shift.id,
    );

    if (isCollision) {
        throw new ApiError(
            409,
            "CONFLICT",
            "Swap request on this shift and target user already exists.",
        );
    }

    const item = {
        id: crypto.randomUUID(),
        requesterId: requester ? requester.id : "User not found.",
        targetUserId: targetUser ? targetUser.id : "User not found",
        shiftId: dto.shiftId,
        status: "pending",
        createdAt: new Date().toISOString(),
    };
    swapRequests.push(item);

    return {
        id: item.id,
        requester: dto.requester,
        targetUser: dto.targetUser,
        shiftId: dto.shiftId,
        status: item.status as SwapStatus,
        createdAt: item.createdAt,
    };
}

export function updateSwapRequest(
    dto: updateSwapRequestDto,
    targetId: string,
): swapRequestResponseDto {
    const index = swapRequests.findIndex((i) => i.id === targetId);
    if (index === -1) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Swap request with that ID was not found.",
        );
    }
    const item = swapRequests[index];

    if (dto.requester !== undefined) {
        const requester = users.find((u) => u.username === dto.requester);
        if (!requester) {
            throw new ApiError(
                404,
                "NOT_FOUND",
                "Requester user with that username was not found.",
            );
        }
        item.requesterId = requester.id;
    }

    if (dto.targetUser !== undefined) {
        const targetUser = users.find((u) => u.username === dto.targetUser);
        if (!targetUser) {
            throw new ApiError(
                404,
                "NOT_FOUND",
                "Target user with that username was not found.",
            );
        }
        item.targetUserId = targetUser.id;
    }

    if (dto.shiftId !== undefined) {
        const shift = shifts.find((i) => i.id === dto.shiftId);
        if (!shift) {
            throw new ApiError(
                404,
                "NOT_FOUND",
                "Shift with that ID was not found.",
            );
        }
        item.shiftId = dto.shiftId;
    }

    if (dto.shiftId !== undefined || dto.requester !== undefined) {
        const shift =
            dto.shiftId !== undefined
                ? shifts.find((i) => i.id === dto.shiftId)
                : shifts.find((i) => i.id === item.shiftId);
        const requester =
            dto.requester !== undefined
                ? users.find((i) => i.username === dto.requester)
                : users.find((i) => i.id === item.requesterId);
        if (!shift || !requester) {
            throw new ApiError(
                500,
                "INTERNAL_ERROR",
                "Data consistency error: shift or requester missing.",
            );
        }
        if (shift.userId !== requester.id) {
            throw new ApiError(
                409,
                "CONFLICT",
                "Requester is not assigned to that shift.",
            );
        }
    }

    if (dto.status !== undefined) {
        item.status = dto.status;
    }

    swapRequests[index] = item;

    return {
        id: targetId,
        requester: dto.requester,
        targetUser: dto.targetUser,
        shiftId: dto.shiftId,
        status: dto.status,
        createdAt: item.createdAt,
    };
}

export function removeSwapRequest(targetId: string) {
    const index = swapRequests.findIndex((i) => i.id === targetId);
    if (index === -1) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "Swap request with that ID was not found.",
        );
    }
    swapRequests.splice(index, 1);
}
