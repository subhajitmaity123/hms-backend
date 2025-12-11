import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
// import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import patientRecordsRoute from "./router/patientRecords.js"

const app = express();
config({ path: "./config.env" });

// universal CORS + handle preflight
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  // If you rely on cookies, DO NOT use "*" — echo the origin instead:
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-Requested-By"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  // Preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use('/api/v1/patient-record',patientRecordsRoute)

dbConnection();

app.use(errorMiddleware);
export default app;
