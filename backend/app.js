import express from "express";
import dbConnection from "./database/dbConnection.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from all origins (including same origin / dev iframe)
      callback(null, true);
    },
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);

dbConnection();

// CRITICAL route-level fallback: Express error middleware for database offline gracefully
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (typeof err.message === "string" &&
      err.message.includes("buffering timed out"))
  ) {
    console.warn(
      "[AI Studio] Database offline — returning mock empty response"
    );
    if (req.method === "GET") {
      return res.json(
        req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {}
      );
    }
    return res.status(503).json({
      error: "Service temporarily unavailable (database offline)",
    });
  }
  next(err);
});

app.use(errorMiddleware);

export default app;
