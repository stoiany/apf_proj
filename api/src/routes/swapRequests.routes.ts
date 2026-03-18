import {Router} from "express";
import {getSwapRequestById, getSwapRequests, postSwapRequest, putSwapRequest, deleteSwapRequest} from "../controllers/swapRequests.controllers";
import {validate} from "../middleware/validation";
import {createSwapRequestSchema, updateSwapRequestSchema} from "../schemas/swapRequest.schemas";

export const swapRequestsRouter = Router();

swapRequestsRouter.get("/", getSwapRequests);
swapRequestsRouter.get("/:id", getSwapRequestById);
swapRequestsRouter.post("/", validate(createSwapRequestSchema), postSwapRequest);
swapRequestsRouter.put("/:id", validate(updateSwapRequestSchema), putSwapRequest);
swapRequestsRouter.delete("/:id", deleteSwapRequest);
