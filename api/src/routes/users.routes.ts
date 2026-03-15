import {Router} from "express";
import {deleteUser, getUserById, getUsers, postUser, putUser} from "../controllers/users.controllers";
import {validate} from "../middleware/validation";
import {createUserSchema, updateUserSchema} from "../schemas/users.schemas";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", validate(createUserSchema), postUser);
userRouter.put("/:id", validate(updateUserSchema), putUser);
userRouter.delete("/:id", deleteUser);