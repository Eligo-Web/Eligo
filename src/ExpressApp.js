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

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import { idp, sp } from "./data/Auth.js";
import Course from "./routes/courses.js";
import Instructor from "./routes/instructors.js";
import Student from "./routes/students.js";

const app = express();

let limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(limiter);
app.use(verifyToken);
app.use("/instructor", Instructor);
app.use("/student", Student);
app.use("/course", Course);

app.post("/signin", async (req, res, next) => {
  const options = { request_body: req.body };
  try {
    sp.post_assert(idp, options, function (err, saml_response) {
      if (err != null) {
        return res.status(500).json({
          status: 500,
          message: `Error: ${err}`,
          data: null,
        });
      }
      const affiliation =
        saml_response.user.attributes.user_field_affiliation[0];
      const first_name = saml_response.user.attributes.firstName[0];
      const last_name = saml_response.user.attributes.lastName[0];
      const email =
        saml_response.user.attributes["urn:oid:1.2.840.113556.1.4.656"][0];

      const user = {
        affiliation: affiliation,
        firstName: first_name,
        lastName: last_name,
        email: email,
      };
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });
      const stringifiedUser = Buffer.from(JSON.stringify(user)).toString(
        "base64"
      );
      res.cookie("jwt", token, { httpOnly: true, secure: true });
      res.redirect(`/?user=${stringifiedUser}`);
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err) {
    const code = err.status || 500;
    res.status(code).json({
      status: code,
      message: err.message || `Internal Server Error!`,
      data: null,
    });
  }
  next();
});

function verifyToken(req, res, next) {
  if (
    req.path === "/instructor/signin" ||
    req.path === "/student/signin" ||
    req.path === "/signin"
  ) {
    return next();
  } else {
    try {
      const token = req.cookies.jwt;
      if (!token) {
        res.redirect("/");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.redirect("/");
    }
  }
}

export default app;
