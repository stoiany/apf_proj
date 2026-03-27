import {
    createUser,
    readUserById,
    readUsers,
    removeUser,
    updateUser,
} from "../services/users.services";
import { Request, Response } from "express";
import {createUserDto, updateUserDto, userQueryParamsDto} from "../schemas/users.schemas";
import {targetIdDto} from "../schemas/other.schemas";

export function getUsers(req: Request, res: Response) {
    const dto : userQueryParamsDto = res.locals.query as userQueryParamsDto;
    const dtoArray = readUsers(dto);
    res.status(200).json(dtoArray);
}

export function getUserById(req: Request, res: Response) {
    const targetId : targetIdDto = req.params.id as string;
    const dto = readUserById(targetId);
    res.status(200).json(dto);
}

export function postUser(req: Request, res: Response) {
    const dto : createUserDto = req.body;
    const responseDto = createUser(dto);
    res.status(201).json(responseDto);
}

export function putUser(req: Request, res: Response) {
    const targetId : targetIdDto = req.params.id as string;
    const dto : updateUserDto = req.body;
    const responseDto = updateUser(dto, targetId);
    res.status(200).json(responseDto);
}

export function deleteUser(req: Request, res: Response) {
    const targetId : targetIdDto = req.params.id as string;
    removeUser(targetId);
    res.status(204).send();
}
