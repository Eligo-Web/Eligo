import express from "express";
import InstructorDao from "../data/InstructorDao.js";
import { UserRole } from "../model/UserRole.js";
import * as db from "../data/db.js";
import { toSectionId } from "./courses.js";

const Instructor = express.Router();
export const instructorDao = new InstructorDao();
const server = "http://localhost:3000";

Instructor.get("/", async (req, res) => {
  const instructors = await instructorDao.readAll(req.query);
  res.json({
    status: 200,
    message: `${instructors.length} instructors found`,
    data: instructors,
  });
});

Instructor.get("/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const instructor = await instructorDao.readByEmail(email);
    res.json({
      status: 200,
      message: `Instructor found`,
      data: instructor,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `No instructor found`,
      data: null,
    });
  }
});

Instructor.post("/", async (req, res) => {
  instructorDao.create(req.body);
  res.json({
    status: 201,
    message: "Instructor created",
    data: req.body,
  });
});

Instructor.put("/:email", async (req, res) => {
  const email = req.params.email;
  const newCourse = req.body.newCourse;
  const newSection = req.body.newSection;
  const newSemester = req.body.newSemester;
  const sectionId = toSectionId(newCourse + newSection + newSemester);
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
    console.log(err);
    res.json({
      status: 404,
      message: `Instructor not found`,
      data: null,
    });
  }
});

Instructor.put("/:email/:semester/:sectionId", async (req, res) => {
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
    console.log(err);
    res.json({
      status: 404,
      message: `Instructor not found`,
      data: null,
    });
  }
});

Instructor.delete("/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const instructor = await instructorDao.deleteByEmail(email);
    res.json({
      status: 200,
      message: `Instructor deleted`,
      data: instructor,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `Instructor not found`,
      data: null,
    });
  }
});

Instructor.delete("/:email/:semester/:sectionId", async (req, res) => {
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
    console.log(err);
    res.json({
      status: 404,
      message: `Instructor with email ${email} not found`,
      data: null,
    });
  }
});

export default Instructor;
