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

import express from "express";
import { idp, sp } from "../data/Auth.js";
import StudentDao from "../data/StudentDao.js";
import { decodeEmail } from "./courses.js";

const Student = express.Router();
export const studentDao = new StudentDao();
Student.get("/signin", async (req, res, next) => {
  try {
    sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
      if (err != null) {
        return res.status(500).json({
          status: 500,
          message: `Error: ${err}`,
          data: null,
        });
      }
      return res.json({
        status: 200,
        message: `Login URL created`,
        data: login_url,
      });
    });
  } catch (err) {
    next(err);
  }
});

Student.get("/current-user", async (req, res, next) => {
  try {
    const user = await studentDao.readByEmail(req.user.email);
    res.json({
      status: 200,
      message: "Student found",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

Student.delete("/signout", (req, res, next) => {
  try {
    res.clearCookie("jwt", { secure: true, httpOnly: true }).json({
      status: 200,
      message: "Cookie cleared",
      data: null,
    });
  } catch (err) {
    next(err);
  }
});

Student.get("/:email", async (req, res, next) => {
  const email = req.params.email;
  try {
    const student = await studentDao.readByEmail(email);
    res.json({
      status: 200,
      message: `Student found`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

Student.get(
  "/clicker/:semester/:sectionId/:clickerId",
  async (req, res, next) => {
    const semester = req.params.semester;
    const sectionId = req.params.sectionId;
    const clickerId = req.params.clickerId;
    try {
      const student = await studentDao.readByClickerIdInCourse(
        semester,
        sectionId,
        clickerId
      );
      res.json({
        status: 200,
        message: `Student found`,
        data: student,
      });
    } catch (err) {
      next(err);
    }
  }
);

Student.post("/", async (req, res, next) => {
  try {
    const student = await studentDao.create(req.body);
    res.status(201).json({
      status: 201,
      message: "Student created",
      data: req.body,
    });
  } catch (err) {
    next(err);
  }
});

Student.put("/:email", async (req, res, next) => {
  const email = req.params.email;
  const sectionId = req.body.sectionId;
  const semester = req.body.semester;
  try {
    const student = await studentDao.addToHistory(email, sectionId, semester);
    res.json({
      status: 200,
      message: `Student updated`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

Student.put("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = decodeEmail(req.params.email);
  const oldSemester = req.params.semester;
  const newSemester = req.body.newSemester;
  const oldSectionId = req.params.sectionId;
  const newSectionId = req.body.newSectionId;
  try {
    const student = await studentDao.updateHistory(
      email,
      oldSemester,
      newSemester,
      oldSectionId,
      newSectionId
    );
    res.json({
      status: 200,
      message: `Student updated`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

Student.patch("/:email/:clickerId", async (req, res, next) => {
  const email = req.params.email;
  const clickerId = req.params.clickerId;
  try {
    const student = await studentDao.updateClickerId(email, clickerId);
    res.json({
      status: 200,
      message: `Student updated`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

Student.delete("/:email", async (req, res, next) => {
  const email = req.params.email;
  try {
    const student = await studentDao.deleteByEmail(email);
    res.json({
      status: 200,
      message: `Student with email ${email} deleted`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

Student.delete("/:email/clickerId", async (req, res, next) => {
  const email = req.params.email;
  try {
    const student = await studentDao.deleteClickerId(email);
    res.json({
      status: 200,
      message: `Student's clickerId with email ${email} deleted`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

Student.delete("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = decodeEmail(req.params.email);
  const semester = req.params.semester;
  const sectionId = req.params.sectionId;
  try {
    const student = await studentDao.deleteFromHistory(
      email,
      semester,
      sectionId
    );
    res.json({
      status: 200,
      message: `Student with email ${email} deleted`,
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

export default Student;
