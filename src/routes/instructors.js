import express from "express";
import InstructorDao from "../data/InstructorDao.js";
import { UserRole } from "../model/UserRole.js";
import * as db from "../data/db.js";

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

Instructor.get("/:id", async (req, res) => {
  const { id } = req.params;
  const instructor = await instructorDao.read(id);
  res.json({
    status: 200,
    message: `Insrtuctor found`,
    data: instructor,
  });
});

Instructor.post("/", async (req, res) => {
  instructorDao.create(req.body);
  res.json({
    status: 201,
    message: "Instructor created",
    data: req.body,
  });
});

export default Instructor;
