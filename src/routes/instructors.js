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
import InstructorDao from "../data/InstructorDao.js";
import { toSectionId } from "./courses.js";

const Instructor = express.Router();
export const instructorDao = new InstructorDao();

Instructor.get("/", async (req, res, next) => {
  if (req.headers.API_KEY !== process.env.API_KEY) {
    return res.json({
      status: 401,
      message: `Unauthorized`,
      data: null,
    });
  }
  const instructors = await instructorDao.readAll(req.query);
  try {
    res.json({
      status: 200,
      message: `${instructors.length} instructors found`,
      data: instructors,
    });
  } catch (err) {
    next(err);
  }
});

Instructor.get("/signin", async (req, res, next) => {
  sp.create_login_request_url(idp, {}, function (err, login_url, request_id) {
    if (err != null) {
      return res.json({
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
});

Instructor.get("/:email", async (req, res, next) => {
  const email = req.user.email;
  try {
    const instructor = await instructorDao.readByEmail(email);
    res.json({
      status: 200,
      message: `Instructor found`,
      data: instructor,
    });
  } catch (err) {
    next(err);
  }
});

Instructor.post("/", async (req, res, next) => {
  try {
    const instructor = await instructorDao.create(req.body);
    res.json({
      status: 201,
      message: "Instructor created",
      data: req.body,
    });
  } catch (err) {
    next(err);
  }
});

Instructor.put("/:email", async (req, res, next) => {
  const email = req.params.email;
  const newCourse = req.body.newCourse;
  const newSection = req.body.newSection;
  const newSemester = req.body.newSemester;
  const sectionId = toSectionId(newCourse, newSection, newSemester);
  try {
    const instructor = await instructorDao.addToHistory(
      email,
      newSemester,
      sectionId
    );
    res.json({
      status: 200,
      message: `Instructor updated`,
      data: instructor,
    });
  } catch (err) {
    next(err);
  }
});

Instructor.put("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = req.params.email;
  const oldSemester = req.params.semester;
  const newSemester = req.body.newSemester;
  const oldSectionId = req.params.sectionId;
  const newSectionId = req.body.newSectionId;
  try {
    const instructor = await instructorDao.updateHistory(
      email,
      oldSemester,
      newSemester,
      oldSectionId,
      newSectionId
    );
    res.json({
      status: 200,
      message: `Instructor updated`,
      data: instructor,
    });
  } catch (err) {
    next(err);
  }
});

Instructor.delete("/:email", async (req, res, next) => {
  const email = req.params.email;
  try {
    const instructor = await instructorDao.deleteByEmail(email);
    res.json({
      status: 200,
      message: `Instructor deleted`,
      data: instructor,
    });
  } catch (err) {
    next(err);
  }
});

Instructor.delete("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = req.params.email;
  const semester = req.params.semester;
  const sectionId = req.params.sectionId;
  try {
    const instructor = await instructorDao.deleteFromHistory(
      email,
      semester,
      sectionId
    );
    res.json({
      status: 200,
      message: `Instructor updated`,
      data: instructor,
    });
  } catch (err) {
    next(err);
  }
});

export default Instructor;
