import express from "express";
import cors from "cors";
import helmet from "helmet";
import Instructor from "./routes/instructors.js";
import Student from "./routes/students.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/instructor", Instructor);
app.use("/student", Student);

export default app;
