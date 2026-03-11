import {Request, Response, NextFunction} from "express";
import {ApiError} from "./ApiError.class";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction){
    if(err instanceof ApiError){
        return res.status(err.status).json({
            code: err.code,
            message: err.message,
            details: err.details,
        });
    } else {
        console.log("500: ", err)
        return res.status(500).json({
           code: "INTERNAL_SERVER_ERROR",
           message: "Щось пішло не так на сервері.",
        });
    }
}

export function pathHandler(req: Request, res: Response, next: NextFunction){
    const error = new ApiError(404, "PATH_NOT_FOUND", "Path you are trying to access doesn't exist.")
    next(error);
}