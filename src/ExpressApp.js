import cors from "cors";
import express from "express";
import helmet from "helmet";
import Course from "./routes/courses.js";
import Instructor from "./routes/instructors.js";
import Student from "./routes/students.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/instructor", Instructor);
app.use("/student", Student);
app.use("/course", Course);

app.use((err, req, res, next) => {
  if (err) {
    const code = err.status || 500;
    res.json({
      status: code,
      message: err.message || `Internal Server Error!`,
      data: null,
    });
  }
  next();
});

export default app;
