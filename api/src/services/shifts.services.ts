import {shifts} from "../repositories/shifts.repo";
import {users} from "../repositories/users.repo";
import {ApiError} from "../middleware/ApiError.class";
import {Request} from "express";
import crypto from "crypto";
import {createShiftDto, shiftResponseDto, updateShiftDto} from "../schemas/shift.schemas";

export type ShiftTime = "morning" | "day" | "evening";
export type ShiftStatus = "scheduled" | "completed" | "missed";

export function readShifts(sortBy : string, sortDir : string, statusFilter : string, userIdFilter : string) : shiftResponseDto[] {
    let processedArray = shifts;

    if(statusFilter){
        processedArray = processedArray.filter(s => s.status === statusFilter);
    }

    if(userIdFilter){
        processedArray = processedArray.filter(s => s.userId === userIdFilter);
    }

    const mappedArray = processedArray.map((item) => {
        const user = users.find(u => u.id === item.userId);
        return {
            id: item.id,
            username: user ? user.username : "User not found.",
            date: item.date,
            time: item.time as ShiftTime,
            status: item.status as ShiftStatus,
            comment: item.comment,
            createdAt: item.createdAt,
        }
    });

    if (!sortBy) {
        return mappedArray;
    }

    mappedArray.sort((a, b) => {
        let comparison: number;

        const valueA = a[sortBy as keyof typeof a];
        const valueB = b[sortBy as keyof typeof b];

        if (sortBy === "date" || sortBy === "createdAt") {
            const timeA = new Date(valueA as string).getTime();
            const timeB = new Date(valueB as string).getTime();
            comparison = timeA - timeB;
        } else {
            const strA = String(valueA || "");
            const strB = String(valueB || "");
            comparison = strA.localeCompare(strB);
        }

        if (sortDir === "desc") {
            return comparison * -1;
        }

        return comparison;
    });

    return mappedArray;
}

export function readShiftById(req: Request){
    const targetId = req.params.id;
    const item = shifts.find(item => item.id === targetId);

    if(!item){
        throw new ApiError(404, "NOT_FOUND", "Shift with that ID was not found.");
    }
    const user = users.find(u => u.id === item.userId);
    return {
        id: item.id,
        username: user ? user.username : "User not found.",
        date: item.date,
        time: item.time,
        status: item.status,
        comment: item.comment,
        createdAt: item.createdAt,
    }
}

export function createShift(dto: createShiftDto) : shiftResponseDto {

    const targetDate = dto.date;
    const targetTime = dto.time;

    const isCollision = shifts.some(s =>
        s.date === targetDate &&
        s.time === targetTime &&
        s.status !== "canceled"
    );

    if(isCollision) {
        throw new ApiError(409, "TIME_CONFLICT", "Shift on that date and time already exists.")
    }

    const user = users.find(u => u.username === dto.username);
    let userId;
    if(!user) {
        const newUser = {
            id: crypto.randomUUID(),
            username: dto.username,
        }
        users.push(newUser);
        userId = newUser.id;
    } else {
        userId = user.id;
    }

    const item = {
        id: crypto.randomUUID(),
        userId: userId,
        date: dto.date,
        time: dto.time,
        status: dto.status,
        comment: dto.comment,
        createdAt: new Date().toISOString()
    };
    shifts.push(item);

    return {
        id: item.id,
        username: dto.username,
        date: dto.date,
        time: dto.time,
        status: dto.status,
        comment: dto.comment,
        createdAt: item.createdAt
    };
}

export function updateShift(dto : updateShiftDto, targetId : string) : shiftResponseDto {
    const indexInArray = shifts.findIndex(item => item.id === targetId);

    if(indexInArray === -1){
        throw new ApiError(404, "NOT_FOUND", "Shift with that ID was not found.");
    }

    let item = shifts[indexInArray];

    const targetDate : string = dto.date !== undefined ? dto.date : item.date;
    const targetTime : string = dto.time !== undefined ? dto.time : item.time;

    if(dto.date !== undefined || dto.time !== undefined){
        const isCollision = shifts.some(s =>
            s.date === targetDate &&
            s.time === targetTime &&
            s.id !== item.id &&
            s.status !== "canceled"
        );

        if(isCollision) {
            throw new ApiError(409, "TIME_CONFLICT", "Shift on that date and time already exists.")
        }
    }

    let dtoUsername;
    if(dto.username !== undefined){
        const user = users.find(u => u.username === dto.username);
        if (!user) {
            const newUser = {
                id: crypto.randomUUID(),
                username: dto.username,
            }
            users.push(newUser);
            item.userId = newUser.id;
        } else {
            item.userId = user.id;
        }
        dtoUsername = dto.username;
    } else {
        const user = users.find(u => u.id === item.userId);
        dtoUsername = user ? user.username : "Not found";
    }

    if(dto.status !== undefined) item.status = dto.status;
    if(dto.date !== undefined) item.date = dto.date;
    if(dto.time !== undefined) item.time = dto.time;
    if(dto.comment !== undefined) item.comment = dto.comment;

    shifts[indexInArray] = item;

    return {
        id: item.id,
        username: dtoUsername,
        date: item.date,
        time: item.time as ShiftTime,
        status: item.status as ShiftStatus,
        comment: item.comment,
        createdAt: item.createdAt
    }
}

export function removeShift(req: Request){
    const targetId = req.params.id;
    const indexInArray = shifts.findIndex(item => item.id === targetId);

    if(indexInArray === -1){
        throw new ApiError(404, "NOT_FOUND", "Shift with that ID was not found.");
    }

    shifts.splice(indexInArray, 1);
}