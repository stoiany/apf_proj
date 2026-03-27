import { users } from "../repositories/users.repo";
import { ApiError } from "../middleware/ApiError.class";
import {
    createUserDto,
    updateUserDto, userQueryParamsDto,
    userResponseDto,
} from "../schemas/users.schemas";
import crypto from "crypto";
import { shifts } from "../repositories/shifts.repo";
import {targetIdDto} from "../schemas/other.schemas";

export function readUsers(dto : userQueryParamsDto): userResponseDto[] {
    const mappedArray = users.map((user) => {
        return {
            id: user.id,
            username: user.username,
        };
    });

    if (!dto.sortBy) {
        return mappedArray;
    }

    mappedArray.sort((a, b) => {
        const valueA = a[dto.sortBy as keyof typeof a];
        const valueB = b[dto.sortBy as keyof typeof b];

        const strA = String(valueA || "");
        const strB = String(valueB || "");
        const comparison = strA.localeCompare(strB);

        if (dto.sortDir === "desc") {
            return comparison * -1;
        }

        return comparison;
    });

    return mappedArray;
}

export function readUserById(targetId : targetIdDto) {
    const user = users.find((u) => u.id === targetId);

    if (!user) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "User with that ID was not found.",
        );
    }
    return {
        id: user.id,
        username: user.username,
    };
}

export function createUser(dto: createUserDto): userResponseDto {
    const user = users.find((u) => u.username === dto.username);
    if (user) {
        throw new ApiError(
            409,
            "USERNAME_CONFLICT",
            "User with that name already exists.",
        );
    }

    const newUser = {
        id: crypto.randomUUID(),
        username: dto.username,
    };
    users.push(newUser);
    return {
        id: newUser.id,
        username: dto.username,
    };
}

export function updateUser(
    dto: updateUserDto,
    targetId: string,
): userResponseDto {
    const indexInArray = users.findIndex((u) => u.id === targetId);
    if (indexInArray === -1) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "User with that ID was not found.",
        );
    }

    const isConflict = users.find((u) => u.username === dto.username);
    if (isConflict) {
        throw new ApiError(
            409,
            "USERNAME_CONFLICT",
            "User with that name already exists.",
        );
    }

    const user = users[indexInArray];
    user.username = dto.username;
    users[indexInArray] = user;

    return {
        id: user.id,
        username: dto.username,
    };
}

export function removeUser(targetId : targetIdDto) {
    const indexInArray = users.findIndex((u) => u.id === targetId);

    if (indexInArray === -1) {
        throw new ApiError(
            404,
            "NOT_FOUND",
            "User with that ID was not found.",
        );
    }

    const isReferenced = shifts.some((i) => i.userId === targetId);
    if (isReferenced) {
        throw new ApiError(
            409,
            "CONFLICT",
            "Cannot delete user. This user has existing shifts assigned to them.",
        );
    }

    users.splice(indexInArray, 1);
}
