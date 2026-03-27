import { Router } from "express";
import {
    deleteUser,
    getUserById,
    getUsers,
    postUser,
    putUser,
} from "../controllers/users.controllers";
import {validateBody, validateParams, validateQuery} from "../middleware/validation";
import {createUserSchema, updateUserSchema, userQueryParamsSchema} from "../schemas/users.schemas";
import {targetIdSchema} from "../schemas/other.schemas";

export const userRouter = Router();

userRouter.get("/", validateQuery(userQueryParamsSchema), getUsers);
userRouter.get("/:id", validateParams(targetIdSchema), getUserById);
userRouter.post("/", validateBody(createUserSchema), postUser);
userRouter.put("/:id", validateBody(updateUserSchema), validateParams(targetIdSchema), putUser);
userRouter.delete("/:id", validateParams(targetIdSchema), deleteUser);
