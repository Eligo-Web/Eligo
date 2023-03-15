import express from "express";
import StudentDao from "../data/StudentDao.js";
import { UserRole } from "../model/UserRole.js";
import * as db from "../data/db.js";

const Student = express.Router();
export const studentDao = new StudentDao();

Student.get("/", async (req, res) => {
  try {
    const students = await studentDao.readAll(req.query);
    res.json({
      status: 200,
      message: `${students.length} students found`,
      data: students,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `No students found`,
      data: null,
    });
  }
});

Student.get("/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const student = await studentDao.readByEmail(email);
    res.json({
      status: 200,
      message: `Student found`,
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `No student found`,
      data: null,
    });
  }
});

Student.post("/", async (req, res) => {
  try {
    studentDao.create(req.body);
    res.json({
      status: 201,
      message: "Student created",
      data: req.body,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 409,
      message: "Student already exists",
      data: req.body,
    });
  }
});

Student.put("/:email", async (req, res) => {
  const email = req.params.email;
  const sectionId = req.body.sectionId;
  const semester = req.body.semester;
  try {
    const student = await studentDao.addToHistory(
      email,
      sectionId,
      semester
    );
    res.json({
      status: 200,
      message: `Student updated`,
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `No student found`,
      data: null,
    });
  }
});

Student.delete("/:email", async (req, res) => {
  const email = req.params.email;
  try {
    const student = await studentDao.deleteByEmail(email);
    res.json({
      status: 200,
      message: `Student with email ${email} deleted`,
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `No student found`,
      data: null,
    });
  }
});

export default Student;
