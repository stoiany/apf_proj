import express, { Request, Response } from "express";
import cors from "cors";
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
import {ApiError} from "./middleware/ApiError.class";
import {demoAuth} from "./middleware/demoAuth.middleware";

const app = express();
app.use(loggingMiddleware);
app.use(express.json());

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);

        if (allowedOrigins.includes(origin)) return cb(null, true);

        const callbackError = new ApiError(
            403,
            "CORS_ERROR",
            "Origin is not allowed by CORS policy",
            { rejectedOrigin: origin }
        )
        return cb(callbackError, false);
    },
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "X-Demo-UserId"]
}));

app.options(/.*/, cors());

app.use(demoAuth);

app.use("/api/v1/shifts", shiftRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/swapRequests", swapRequestsRouter);
app.use("/api/v1/schedules", schedulesRouter);

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