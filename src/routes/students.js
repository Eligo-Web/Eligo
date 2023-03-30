import express from "express";
import StudentDao from "../data/StudentDao.js";
import { decodeEmail } from "./courses.js";

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
      status: err.status,
      message: err.message,
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
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

Student.get("/clicker/:semester/:sectionId/:clickerId", async (req, res) => {
  const semester = req.params.semester;
  const sectionId = req.params.sectionId;
  const clickerId = req.params.clickerId;
  try {
    const student = await studentDao.readByClickerIdInCourse(
      clickerId,
      semester,
      sectionId
    );
    res.json({
      status: 200,
      message: `Student found`,
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: err.status,
      message: err.message,
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
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

Student.put("/:email", async (req, res) => {
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
    console.log(err);
    res.json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

Student.put("/:email/:semester/:sectionId", async (req, res) => {
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
    console.log(err);
    res.json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

Student.patch("/:email/:clickerId", async (req, res) => {
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
    console.log(err);
    res.json({
      status: err.status,
      message: err.message,
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
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

Student.delete("/:email/clickerId", async (req, res) => {
  const email = req.params.email;
  try {
    const student = await studentDao.deleteClickerId(email);
    res.json({
      status: 200,
      message: `Student's clickerId with email ${email} deleted`,
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

Student.delete("/:email/:semester/:sectionId", async (req, res) => {
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
    console.log(err);
    res.json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }
});

export default Student;
