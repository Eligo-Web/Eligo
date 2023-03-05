import express from "express";
import StudentDao from "../data/StudentDao.js";
import { UserRole } from "../model/UserRole.js";
import * as db from "../data/db.js";

const Student = express.Router();
export const studentDao = new StudentDao();
const server = "http://localhost:3000";

Student.get("/", async (req, res) => {
  const students = await studentDao.readAll(req.query);
  res.json({
    status: 200,
    message: `${students.length} students found`,
    data: students,
  });
});

Student.get("/:id", async (req, res) => {
  const { id } = req.params;
  const student = await studentDao.read(id);
  res.json({
    status: 200,
    message: `Student found`,
    data: student,
  });
});

Student.post("/", async (req, res) => {
  studentDao.create(req.body);
  res.json({
    status: 201,
    message: "Student created",
    data: req.body,
  });
});

export default Student;
