import express, { Request, Response } from "express";
import {errorHandler, pathHandler} from "./middleware/error-handler.middleware";
import {loggingMiddleware} from "./middleware/logging.middleware";
import {shiftRouter} from "./routes/shifts.routes";
import {userRouter} from "./routes/users.routes";
import {swapRequestsRouter} from "./routes/swapRequests.routes";
import {schedulesRouter} from "./routes/schedules.routes";

const app = express();
app.use(express.json());

app.use(loggingMiddleware);

app.use("/api/shifts", shiftRouter);
app.use("/api/users", userRouter);
app.use("/api/swapRequests", swapRequestsRouter);
app.use("/api/schedules", schedulesRouter);

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ ok: true });
});

app.use(pathHandler);
app.use(errorHandler);

app.listen(3000, () => console.log("API started on http://localhost:3000"));