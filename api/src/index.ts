import express, { Request, Response } from "express";
import {
    errorHandler,
    pathHandler,
} from "./middleware/error-handler.middleware";
import { loggingMiddleware } from "./middleware/logging.middleware";
import { shiftRouter } from "./routes/shifts.routes";
import { userRouter } from "./routes/users.routes";
import { swapRequestsRouter } from "./routes/swapRequests.routes";
import { schedulesRouter } from "./routes/schedules.routes";
import {migrate} from "./db/migrate";

const app = express();
app.use(loggingMiddleware);
app.use(express.json());

app.use("/api/shifts", shiftRouter);
app.use("/api/users", userRouter);
app.use("/api/swapRequests", swapRequestsRouter);
app.use("/api/schedules", schedulesRouter);

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ ok: true });
});

app.use(pathHandler);
app.use(errorHandler);

async function bootstrap() : Promise<void> {
    await migrate();
    console.log("Database schema initialized successfully.");
    app.listen(3000, () => console.log("API started on http://localhost:3000"));
}

bootstrap().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
});