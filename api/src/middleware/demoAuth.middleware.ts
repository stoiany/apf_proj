import { Request, Response, NextFunction } from "express";
import {ApiError} from "./ApiError.class";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export function demoAuth(req: Request, res: Response, next: NextFunction) {
    const userId = req.header("X-Demo-UserId");

    if(!userId){
        throw new ApiError(401, "UNAUTHORIZED", "Missing X-Demo-UserId header");
    }
    req.user = { id: userId };
    next();
}