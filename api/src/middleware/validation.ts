import {ZodType} from "zod";
import {NextFunction, Request, Response} from "express";
import {ApiError} from "./ApiError.class";
import {shiftQueryParamsDto} from "../schemas/shift.schemas";

export const validateBody = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const FormattedErrors = result.error.issues.map((err) => ({
                message: err.message,
                field: err.path[0],
            }));
            return next(
                new ApiError(
                    400,
                    "VALIDATION_ERROR",
                    "Invalid request body",
                    FormattedErrors,
                ),
            );
        }

        req.body = result.data;
        next();
    };
};

export const validateParams = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const paramsResult = schema.safeParse(req.params.id);

        if (!paramsResult.success) {
            const FormattedErrors = paramsResult.error.issues.map((err) => ({
                message: err.message,
                field: err.path[0],
            }));
            return next(
                new ApiError(
                    400,
                    "VALIDATION_ERROR",
                    "Invalid request params",
                    FormattedErrors,
                ),
            );
        }

        req.params.id = paramsResult.data as string;
        next();
    };
};

export const validateQuery = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const FormattedErrors = result.error.issues.map((err) => ({
                message: err.message,
                field: err.path[0],
            }));
            return next(
                new ApiError(
                    400,
                    "VALIDATION_ERROR",
                    "Invalid request query params",
                    FormattedErrors,
                ),
            );
        }

        res.locals.query = result.data as shiftQueryParamsDto;
        next();
    };
};