import {users} from "../repositories/users.repo";
import {ApiError} from "../middleware/ApiError.class";
import {Request} from "express";
import {createUserDto, updateUserDto, userResponseDto} from "../schemas/users.schemas";
import crypto from "crypto";
import {shifts} from "../repositories/shifts.repo";

export function readUsers(sortBy : string, sortDir : string) : userResponseDto[] {
    const mappedArray = users.map(user => {
        return {
            id: user.id,
            username: user.username,
        };
    });

    if (!sortBy) {
        return mappedArray;
    }

    mappedArray.sort((a, b) => {
        let comparison: number;

        const valueA = a[sortBy as keyof typeof a];
        const valueB = b[sortBy as keyof typeof b];

        const strA = String(valueA || "");
        const strB = String(valueB || "");
        comparison = strA.localeCompare(strB);

        if (sortDir === "desc") {
            return comparison * -1;
        }

        return comparison;
    });

    return mappedArray;
}

export function readUserById(req: Request){
    const targetId = req.params.id;
    const user = users.find(u => u.id === targetId);

    if(!user){
        throw new ApiError(404, "NOT_FOUND", "User with that ID was not found.");
    }
    return {
        id: user.id,
        username: user.username,
    }
}

export function createUser (dto : createUserDto) : userResponseDto {
    const user = users.find(u => u.username === dto.username);
    if(user){
        throw new ApiError(409, "USERNAME_CONFLICT", "User with that name already exists.");
    }

    const newUser = {
        id: crypto.randomUUID(),
        username: dto.username,
    }
    users.push(newUser);
    return {
        id: newUser.id,
        username: dto.username,
    }
}

export function updateUser (dto : updateUserDto, targetId : string) : userResponseDto {
    const indexInArray = users.findIndex(u => u.id === targetId);
    if(indexInArray === -1){
        throw new ApiError(404, "NOT_FOUND", "User with that ID was not found.");
    }

    const isConflict = users.find(u => u.username === dto.username);
    if(isConflict){
        throw new ApiError(409, "USERNAME_CONFLICT", "User with that name already exists.");
    }

    let user = users[indexInArray];
    user.username = dto.username;
    users[indexInArray] = user;

    return {
        id: user.id,
        username: dto.username,
    }
}

export function removeUser (req: Request){
    const targetId = req.params.id;
    const indexInArray = users.findIndex(u => u.id === targetId);

    if(indexInArray === -1){
        throw new ApiError(404, "NOT_FOUND", "User with that ID was not found.");
    }

    const isReferenced = shifts.some(i => i.userId === targetId);
    if(isReferenced){
        throw new ApiError(409, "CONFLICT", "Cannot delete user. This user has existing shifts assigned to them.");
    }

    users.splice(indexInArray, 1);
}