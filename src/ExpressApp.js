// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
