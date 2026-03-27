import { Router } from "express";
import {
    getSwapRequestById,
    getSwapRequests,
    postSwapRequest,
    putSwapRequest,
    deleteSwapRequest,
} from "../controllers/swapRequests.controllers";
import {validateBody, validateParams, validateQuery} from "../middleware/validation";
import {
    createSwapRequestSchema, swapReqQueryParamsSchema,
    updateSwapRequestSchema,
} from "../schemas/swapRequest.schemas";
import {targetIdSchema} from "../schemas/other.schemas";

export const swapRequestsRouter = Router();

swapRequestsRouter.get("/", validateQuery(swapReqQueryParamsSchema), getSwapRequests);
swapRequestsRouter.get("/:id", validateParams(targetIdSchema), getSwapRequestById);
swapRequestsRouter.post(
    "/",
    validateBody(createSwapRequestSchema),
    postSwapRequest,
);
swapRequestsRouter.put(
    "/:id",
    validateBody(updateSwapRequestSchema),
    validateParams(targetIdSchema),
    putSwapRequest,
);
swapRequestsRouter.delete("/:id", validateParams(targetIdSchema), deleteSwapRequest);
