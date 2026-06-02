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
import {ApiError} from "../middleware/ApiError.class";

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
        const currentUserId = req.user!.id;
        if (targetId !== currentUserId) {
            return next(new ApiError(403, "FORBIDDEN", "Access denied. You can only edit your own profile."));
        }
        const responseDto = await updateUser(dto, targetId);
        res.status(200).json(responseDto);
    } catch (err) {
        next(err);
    }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        const targetId : targetIdDto = req.params.id as string;
        const currentUserId = req.user!.id;
        if (targetId !== currentUserId) {
            return next(new ApiError(403, "FORBIDDEN", "Access denied. You can only delete your own profile."));
        }
        await removeUser(targetId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}
