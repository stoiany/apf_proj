import {readUserById, readUsers} from "../services/users.services";
import {Request, Response} from "express";

export function getUsers(req: Request, res: Response){
    const dtoArray = readUsers();
    res.status(200).json(dtoArray);
}

export function getUserById(req: Request, res: Response){
    const dto = readUserById(req);
    res.status(200).json(dto);
}