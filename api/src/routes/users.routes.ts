import {Router} from "express";
import {getUserById, getUsers} from "../controllers/users.controllers";

export const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);