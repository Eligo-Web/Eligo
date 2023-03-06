import express from "express";
import CourseDao from "../data/CourseDao.js";

const Course = express.Router();
export const courseDao = new CourseDao();

Course.get("/", async (req, res) => {
  const courses = await courseDao.readAll(req.query);
  res.json({
    status: 200,
    message: `${courses.length} courses found`,
    data: courses,
  });
});

Course.get("/:id", async (req, res) => {
  const { id } = req.params;
  const coruse = await courseDao.read(id);
  res.json({
    status: 200,
    message: `Course found`,
    data: course,
  });
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
