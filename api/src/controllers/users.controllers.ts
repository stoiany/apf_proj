import {createUser, readUserById, readUsers, removeUser, updateUser} from "../services/users.services";
import {Request, Response} from "express";
import {createUserDto, updateUserDto} from "../schemas/users.schemas";

export function getUsers(req: Request, res: Response){
    const dtoArray = readUsers();
    res.status(200).json(dtoArray);
}

export function getUserById(req: Request, res: Response){
    const dto = readUserById(req);
    res.status(200).json(dto);
}

export function postUser(req: Request, res: Response){
    const dto : createUserDto = req.body;
    const responseDto = createUser(dto);
    res.status(201).json(responseDto);
}

export function putUser(req: Request, res: Response){
    const targetId : string = req.params.id as string;
    const dto : updateUserDto = req.body;
    const responseDto = updateUser(dto, targetId);
    res.status(200).json(responseDto);
}

export function deleteUser(req: Request, res: Response){
    removeUser(req);
    res.status(204).send();
}