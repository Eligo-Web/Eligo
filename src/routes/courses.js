import express from "express";
import hash from "bcryptjs-react";
import CourseDao from "../data/CourseDao.js";

const Course = express.Router();
export const courseDao = new CourseDao();
const { hashSync } = hash;

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
  let course;
  try {
    course = await courseDao.readBySectionId(sectionId);
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
  courseDao.create(req.body);
  res.json({
    status: 201,
    message: "Course created",
    data: req.body,
  });
});

export default Course;
