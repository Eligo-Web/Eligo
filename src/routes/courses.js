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

Course.get("/:id", async (req, res) => {
  console.log(req.params.id);
  const { id } = hashSync(req.params.id, "$2a$10$yYsKdzoWSjjPh4mm33hrLe");
  let course;
  try {
    course = await courseDao.read(id);
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
