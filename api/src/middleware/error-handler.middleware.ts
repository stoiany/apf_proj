import { Request, Response, NextFunction } from "express";
import { ApiError } from "./ApiError.class";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            code: err.code,
            message: err.message,
            details: err.details,
        });
    }

    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            code: "INVALID_JSON",
            message: "Incorrect JSON format in request body.",
        });
    }

    const dbError = err as { code?: string; message?: string };

    if (dbError.code && dbError.code.startsWith("SQLITE_")) {
        if (dbError.code === "SQLITE_CONSTRAINT") {
            res.status(409).json({
                error: {
                    code: "DB_CONSTRAINT_VIOLATION",
                    message: "Database constraint failed: " + dbError.message
                }
            });
            return;
        }

        res.status(400).json({
            error: {
                code: "DB_BAD_REQUEST",
                message: "Invalid database operation."
            }
        });
        return;
    }

    console.log("500: ", err);
    return res.status(500).json({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong on the server.",
    });
}

export function pathHandler(_req: Request, _res: Response, next: NextFunction) {
    const error = new ApiError(
        404,
        "PATH_NOT_FOUND",
        "Path you are trying to access doesn't exist.",
    );
    next(error);
}
