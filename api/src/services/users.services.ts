import {users} from "../repositories/users.repo";
import {ApiError} from "../middleware/ApiError.class";
import {Request} from "express";

export function readUsers(){
    return users.map(user => {
        return {
            id: user.id,
            username: user.username,
        };
    });
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