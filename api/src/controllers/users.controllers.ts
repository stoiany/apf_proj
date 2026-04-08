import {
    createUser,
    readUserById,
    readUsers,
    removeUser,
    updateUser,
} from "../services/users.services";
import {NextFunction, Request, Response} from "express";
import {createUserDto, updateUserDto, userQueryParamsDto} from "../schemas/users.schemas";
import {targetIdDto} from "../schemas/other.schemas";

export async function getUsers(req: Request, res: Response, next: NextFunction) : Promise<void> {
    try {
        const dto: userQueryParamsDto = res.locals.query as userQueryParamsDto;
        const dtoArray = await readUsers(dto);
        res.status(200).json(dtoArray);
    } catch (err) {
        next(err);
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        const dto = await readUserById(targetId);
        res.status(200).json(dto);
    } catch (err) {
        next(err);
    }
}

export async function postUser(req: Request, res: Response, next: NextFunction) {
    try {
        const dto : createUserDto = req.body;
        const responseDto = await createUser(dto);
        res.status(201).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function putUser(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        const dto : updateUserDto = req.body;
        const responseDto = await updateUser(dto, targetId);
        res.status(200).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        await removeUser(targetId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
