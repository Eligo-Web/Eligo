import express from "express";
import InstructorDao from "../data/InstructorDao.js";
import { toSectionId, validateToken } from "./courses.js";

const Instructor = express.Router();
export const instructorDao = new InstructorDao();

Instructor.get("/", async (req, res, next) => {
  const instructors = await instructorDao.readAll(req.query);
  const token = req.headers.token;
  try {
    if (token !== process.env.API_KEY) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `${instructors.length} instructors found`,
        data: instructors,
      });
    }
  } catch (err) {
    next(err);
  }
});

Instructor.get("/:email", async (req, res, next) => {
  const email = req.params.email;
  const token = req.headers.token;
  const requester = req.headers.requester;
  try {
    const valid = await validateToken(token, requester);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const instructor = await instructorDao.readByEmail(email);
      await instructorDao.updateLastLogin(email, token);
      res.json({
        status: 200,
        message: `Instructor found`,
        data: instructor,
      });
    }
  } catch (err) {
    next(err);
  }
});

Instructor.post("/", async (req, res, next) => {
  const token = req.body.token;
  const email = req.body.email;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const instructor = await instructorDao.create(req.body);
      res.json({
        status: 201,
        message: "Instructor created",
        data: req.body,
      });
    }
  } catch (err) {
    next(err);
  }
});

Instructor.put("/:email", async (req, res, next) => {
  const email = req.params.email;
  const newCourse = req.body.newCourse;
  const newSection = req.body.newSection;
  const newSemester = req.body.newSemester;
  const sectionId = toSectionId(newCourse + newSection + newSemester);
  const token = req.body.token;
  try {
    const instructor = await instructorDao.addToHistory(
      email,
      newSemester,
      sectionId
    );
    if (!token || instructor.token !== token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Instructor updated`,
        data: instructor,
      });
    }
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
  const token = req.body.token;
  try {
    const instructor = await instructorDao.updateHistory(
      email,
      oldSemester,
      newSemester,
      oldSectionId,
      newSectionId
    );
    if (!token || instructor.token !== token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Instructor updated`,
        data: instructor,
      });
    }
  } catch (err) {
    next(err);
  }
});

Instructor.delete("/:email", async (req, res, next) => {
  const email = req.params.email;
  const token = req.body.token;
  try {
    const instructor = await instructorDao.deleteByEmail(email);
    if (!token || instructor.token !== token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Instructor deleted`,
        data: instructor,
      });
    }
  } catch (err) {
    next(err);
  }
});

Instructor.delete("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = req.params.email;
  const semester = req.params.semester;
  const sectionId = req.params.sectionId;
  const token = req.body.token;
  try {
    const instructor = await instructorDao.deleteFromHistory(
      email,
      semester,
      sectionId
    );
    if (!token || instructor.token !== token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Instructor updated`,
        data: instructor,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default Instructor;
