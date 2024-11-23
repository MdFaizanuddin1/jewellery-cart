import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public/temp"));
app.use(cookieParser());

//import routes
import healthCheckRouter from "./routes/healthCheck.routes.js";
import userRouter from "./routes/user.routes.js";
import addressRouter from "./routes/address.routes.js";
import schemeRouter from "./routes/scheme.routes.js";
import kycRouter from "./routes/panAadhar.routes.js";
import schemePurchaseRouter from "./routes/schemePurchase.routes.js";

//routes declaration
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/scheme", schemeRouter);
app.use("/api/v1/kyc", kycRouter);
app.use("/api/v1/purchase", schemePurchaseRouter);

export { app };
