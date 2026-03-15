import {ZodType} from "zod";
import {Request, Response, NextFunction} from "express";
import {ApiError} from "./ApiError.class";

export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if(!result.success){
            const FormattedErrors = result.error.issues.map((err:any) => ({
                message: err.message,
                field: err.path[0],
            }));
            return next(new ApiError(400, "VALIDATION_ERROR", "Invalid request body", FormattedErrors));
        }

        req.body = result.data;
        next();
    }
}