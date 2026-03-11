import {shifts} from "../repositories/shifts.repo";
import {users} from "../repositories/users.repo";
import {ApiError} from "../middleware/ApiError.class";
import {Request} from "express";
import crypto from "crypto";

export function readShifts(){
    return shifts.map((item) => {
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
    });
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

export function createShift(req: Request){
    const errors = [];

    if(req.body.username === undefined || typeof req.body.username !== "string" || req.body.username === "" || req.body.username.length > 30){
        errors.push({message: "Username is required and must be under 30 chars.", field: "username"})
    }
    if(req.body.date !== undefined){
        if(typeof req.body.date !== "string"){
            errors.push({message: "Date must be string.", field: "date"});
        }
        const dataRegEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dataRegEx.test(req.body.date)){
            errors.push({message: "Expected date format: YYYY-MM-DD.", field: "date"});
        }
        const parsedDate = new Date(req.body.date);
        if(isNaN(parsedDate.getDate())){
            errors.push({message: "Date isn't correct.", field: "date"});
        }
    } else {
        errors.push({message: "Date is undefined", field:"date"});
    }
    if(req.body.time !== "morning" && req.body.time !== "day" && req.body.time !== "evening"){
        errors.push({message:"Time must be one of those: morning, day, evening", field:"time"});
    }
    if(req.body.status !== "scheduled" && req.body.status !== "completed" && req.body.status !== "missed"){
        errors.push({message:"Status must be one of those: scheduled, completed, missed", field:"status"});
    }
    let safeComment = "";
    if(req.body.comment !== undefined){
        if(req.body.comment.length > 80 || typeof req.body.comment !== "string"){
            errors.push({message:"Comment must be a string and less than 80 chars.", field: "comment"});
        }
        safeComment = req.body.comment;
    }

    if(errors.length > 0){
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body.", errors);
    }

    const targetDate = req.body.date;
    const targetTime = req.body.time;

    const isCollision = shifts.some(s =>
        s.date === targetDate &&
        s.time === targetTime
    );

    if(isCollision) {
        throw new ApiError(409, "TIME_CONFLICT", "Shift on that date and time already exists.")
    }

    const user = users.find(u => u.username === req.body.username);
    let userId;
    if(!user) {
        const newUser = {
            id: crypto.randomUUID(),
            username: req.body.username,
        }
        users.push(newUser);
        userId = newUser.id;
    } else {
        userId = user.id;
    }

    const item = {
        id: crypto.randomUUID(),
        userId: userId,
        date: req.body.date,
        time: req.body.time,
        status: req.body.status,
        comment: safeComment,
        createdAt: new Date().toISOString()
    };
    shifts.push(item);

    return {
        id: item.id,
        username: req.body.username,
        date: req.body.date,
        time: req.body.time,
        status: req.body.status,
        comment: safeComment,
        createdAt: item.createdAt
    };
}

export function updateShift(req: Request){
    const targetId = req.params.id;
    const indexInArray = shifts.findIndex(item => item.id === targetId);

    if(indexInArray === -1){
        throw new ApiError(404, "NOT_FOUND", "Shift with that ID was not found.");
    }

    let item = shifts[indexInArray];
    const errors = [];

    if(req.body.username !== undefined){
        if(typeof req.body.username !== "string" || req.body.username.length > 30 || req.body.username === ""){
            errors.push({message: "Username is required and must be under 30 chars.", field: "username"})
        }
    }
    if(req.body.date !== undefined){
        if(typeof req.body.date !== "string"){
            errors.push({message: "Date must be string.", field: "date"});
        }
        const dataRegEx = /^\d{4}-\d{2}-\d{2}$/;
        if(!dataRegEx.test(req.body.date)){
            errors.push({message: "Expected date format: YYYY-MM-DD.", field: "date"});
        }
        const parsedDate = new Date(req.body.date);
        if(isNaN(parsedDate.getDate())){
            errors.push({message: "Date isn't correct.", field: "date"});
        }
    }
    if(req.body.time !== undefined){
        if(req.body.time !== "morning" && req.body.time !== "day" && req.body.time !== "evening"){
            errors.push({message:"Time must be one of those: morning, day, evening", field:"time"});
        }
    }
    if(req.body.status !== undefined){
        if(req.body.status !== "scheduled" && req.body.status !== "completed" && req.body.status !== "missed"){
            errors.push({message:"Status must be one of those: scheduled, completed, missed", field:"status"});
        }
    }
    if(req.body.comment !== undefined){
        if(req.body.comment.length > 80 || typeof req.body.comment !== "string"){
            errors.push({message:"Comment must be a string and less than 80 chars.", field: "comment"});
        }
    }

    if(errors.length > 0){
        throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body.", errors);
    }

    const targetDate : string = req.body.date !== undefined ? req.body.date : item.date;
    const targetTime : string = req.body.time !== undefined ? req.body.time : item.time;

    if(req.body.date !== undefined || req.body.time !== undefined){
        const isCollision = shifts.some(s =>
            s.date === targetDate &&
            s.time === targetTime &&
            s.id !== item.id
        );

        if(isCollision) {
            throw new ApiError(409, "TIME_CONFLICT", "Shift on that date and time already exists.")
        }
    }

    let dtoUsername;
    if(req.body.username !== undefined){
        const user = users.find(u => u.username === req.body.username);
        if (!user) {
            const newUser = {
                id: crypto.randomUUID(),
                username: req.body.username,
            }
            users.push(newUser);
            item.userId = newUser.id;
        } else {
            item.userId = user.id;
        }
        dtoUsername = req.body.username;
    } else {
        const user = users.find(u => u.id === item.userId);
        dtoUsername = user ? user.username : "Not found";
    }

    if(req.body.status !== undefined) item.status = req.body.status;
    if(req.body.date !== undefined) item.date = req.body.date;
    if(req.body.time !== undefined) item.time = req.body.time;
    if(req.body.comment !== undefined) item.comment = req.body.comment;

    shifts[indexInArray] = item;

    return {
        id: item.id,
        username: dtoUsername,
        date: item.date,
        time: item.time,
        status: item.status,
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