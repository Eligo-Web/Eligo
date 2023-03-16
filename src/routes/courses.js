import express from "express";
import hash from "bcryptjs-react";
import CourseDao from "../data/CourseDao.js";

const Course = express.Router();
export const courseDao = new CourseDao();
const { hashSync } = hash;

export function toSectionId(str) {
  return str.replace(/\s/g, "").toLowerCase();
}

Course.get("/", async (req, res) => {
  const courses = await courseDao.readAll(req.query);
  res.json({
    status: 200,
    message: `${courses.length} courses found`,
    data: courses,
  });
});

Course.get("/:sectionId", async (req, res) => {
  const sectionId = req.params.sectionId;
  try {
    let course = await courseDao.readBySectionId(sectionId);
    res.json({
      status: 200,
      message: `Course found`,
      data: course,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `Course not found`,
      data: null,
    });
  }
});

Course.get("/student/:passcode", async (req, res) => {
  const passcode = req.params.passcode;
  try {
    let course = await courseDao.readByPasscode(passcode);
    res.json({
      status: 200,
      message: `Course found`,
      data: course,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: `Course not found`,
      data: null,
    });
  }
});

Course.post("/", async (req, res) => {
  let sectionId = toSectionId(
    req.body.name + req.body.section + req.body.semester
  );
  req.body.sectionId = sectionId;
  try {
    let course = await courseDao.create(req.body);
    res.json({
      status: 201,
      message: "Course created",
      data: req.body,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 409,
      message: "Course already exists",
      data: null,
    });
  }
});

Course.put("/:sectionId", async (req, res) => {
  const sectionId = req.params.sectionId;
  const name = req.body.name;
  const section = req.body.section;
  const semester = req.body.semester;
  const newSisId = req.body.SISId;
  const passcode = req.body.passcode;
  const newSectionId = toSectionId(name + section + semester);
  try {
    const course = await courseDao.update(
      sectionId,
      newSectionId,
      name,
      section,
      semester,
      newSisId,
      passcode
    );
    res.json({
      status: 200,
      message: "Course updated",
      data: req.body,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: "Course not found",
      data: null,
    });
  }
});

Course.put("/:sectionId/:email", async (req, res) => {
  const sectionId = req.params.sectionId;
  const email = req.params.email;
  const name = req.body.name;
  try {
    const course = await courseDao.addStudentByEmail(sectionId, email, name);
    res.json({
      status: 200,
      message: "Student added to course",
      data: course,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: "Course not found",
      data: null,
    });
  }
});

Course.delete("/:sectionId", async (req, res) => {
  const sectionId = req.params.sectionId;
  try {
    const course = await courseDao.deleteBySectionId(sectionId);
    res.json({
      status: 200,
      message: "Course deleted",
      data: course,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: 404,
      message: "Course not found",
      data: null,
    });
  }
});

export default Course;
