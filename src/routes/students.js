import express from "express";
import StudentDao from "../data/StudentDao.js";
import { decodeEmail, validateToken } from "./courses.js";

const Student = express.Router();
export const studentDao = new StudentDao();

Student.get("/", async (req, res, next) => {
  const token = req.headers.token;
  try {
    if (token !== process.env.API_KEY) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const students = await studentDao.readAll(req.query);
      res.json({
        status: 200,
        message: `${students.length} students found`,
        data: students,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.get("/:email", async (req, res, next) => {
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
      const student = await studentDao.readByEmail(email);
      await studentDao.updateLastLogin(email, token);
      res.json({
        status: 200,
        message: `Student found`,
        data: student,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.get(
  "/clicker/:semester/:sectionId/:clickerId",
  async (req, res, next) => {
    const semester = req.params.semester;
    const sectionId = req.params.sectionId;
    const clickerId = req.params.clickerId;
    const email = req.headers.email;
    const token = req.headers.token;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        const student = await studentDao.readByClickerIdInCourse(
          semester,
          sectionId,
          clickerId
        );
        res.json({
          status: 200,
          message: `Student found`,
          data: student,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Student.post("/", async (req, res, next) => {
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
      const student = await studentDao.create(req.body);
      res.json({
        status: 201,
        message: "Student created",
        data: req.body,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.put("/:email", async (req, res, next) => {
  const email = req.params.email;
  const sectionId = req.body.sectionId;
  const semester = req.body.semester;
  const token = req.body.token;
  try {
    const student = await studentDao.addToHistory(email, sectionId, semester);
    if (token !== student.token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Student updated`,
        data: student,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.put("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = decodeEmail(req.params.email);
  const oldSemester = req.params.semester;
  const newSemester = req.body.newSemester;
  const oldSectionId = req.params.sectionId;
  const newSectionId = req.body.newSectionId;
  const token = req.body.token;
  const requester = req.body.requester;
  try {
    const valid = await validateToken(token, requester);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
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
    }
  } catch (err) {
    next(err);
  }
});

Student.patch("/:email/:clickerId", async (req, res, next) => {
  const email = req.params.email;
  const clickerId = req.params.clickerId;
  const token = req.body.token;
  try {
    const student = await studentDao.updateClickerId(email, clickerId);
    if (token !== student.token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Student updated`,
        data: student,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.delete("/:email", async (req, res, next) => {
  const email = req.params.email;
  const token = req.headers.token;
  try {
    const student = await studentDao.deleteByEmail(email);
    if (token !== student.token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Student with email ${email} deleted`,
        data: student,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.delete("/:email/clickerId", async (req, res, next) => {
  const email = req.params.email;
  const token = req.headers.token;
  try {
    if (token !== student.token) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const student = await studentDao.deleteClickerId(email);
      res.json({
        status: 200,
        message: `Student's clickerId with email ${email} deleted`,
        data: student,
      });
    }
  } catch (err) {
    next(err);
  }
});

Student.delete("/:email/:semester/:sectionId", async (req, res, next) => {
  const email = decodeEmail(req.params.email);
  const semester = req.params.semester;
  const sectionId = req.params.sectionId;
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
    }
  } catch (err) {
    next(err);
  }
});

export default Student;
