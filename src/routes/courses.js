import axios from "axios";
import express from "express";
import CourseDao from "../data/CourseDao.js";

const Course = express.Router();
export const courseDao = new CourseDao();

export function toSectionId(str) {
  return str.replace(/\s/g, "").toLowerCase();
}

export function encodeEmail(str) {
  return str.replace(/[.]/g, "$");
}

export function decodeEmail(str) {
  return str.replace(/[$]/g, ".");
}

export async function validateToken(token, email) {
  if (token === process.env.API_KEY) {
    return true;
  }
  try {
    await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`
      )
      .then((res) => {
        if (res.data.email !== email) {
          return false;
        }
      });
  } catch (err) {
    return false;
  }
  return true;
}

Course.get("/", async (req, res, next) => {
  const token = req.headers.token;
  try {
    if (token !== process.env.API_KEY) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const courses = await courseDao.readAll(req.query);
      res.json({
        status: 200,
        message: `${courses.length} courses found`,
        data: courses,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.get("/:sectionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const token = req.headers.token;
  try {
    const course = await courseDao.readBySectionId(sectionId);
    const valid = await validateToken(token, course.instructor["email"]);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Course found`,
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.get("/student/:passcode", async (req, res, next) => {
  const passcode = req.params.passcode;
  const token = req.headers.token;
  const email = req.headers.email;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      let course = await courseDao.readByPasscode(passcode);
      res.json({
        status: 200,
        message: `Course found`,
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.get("/:sectionId/:weekNum/:sessionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const weekNum = req.params.weekNum;
  const sessionId = req.params.sessionId;
  const token = req.headers.token;
  const email = req.headers.email;
  try {
    let session = await courseDao.readSession(sectionId, weekNum, sessionId);
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Session found`,
        data: session,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.get("/:sectionId/:weekNum", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const weekNum = req.params.weekNum;
  const token = req.headers.token;
  const email = req.headers.email;
  try {
    let session = await courseDao.readActiveSession(sectionId, weekNum);
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      res.json({
        status: 200,
        message: `Session found`,
        data: session,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.get("/:sectionId/sessions", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const token = req.headers.token;
  const email = req.headers.email;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      let sessions = await courseDao.readAllSessions(sectionId);
      res.json({
        status: 200,
        message: `Sessions found`,
        data: sessions,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.get(
  "/:sectionId/:weekNum/:sessionId/openPoll",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const token = req.headers.token;
    const email = req.headers.email;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        const poll = await courseDao.readActivePoll(
          sectionId,
          weekNum,
          sessionId
        );
        res.json({
          status: 200,
          message: `Poll found`,
          data: poll,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.get(
  "/:sectionId/:weekNum/:sessionId/:pollId",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const pollId = req.params.pollId;
    const token = req.headers.token;
    const email = req.headers.email;
    try {
      let poll = await courseDao.readPoll(
        sectionId,
        weekNum,
        sessionId,
        pollId
      );
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        res.json({
          status: 200,
          message: `Poll found`,
          data: poll,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.post("/:sectionId/:sessionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const sessionId = req.params.sessionId;
  const name = req.body.name;
  const passcode = req.body.passcode;
  const weekNum = req.body.weekNum;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
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
      const session = await courseDao.createSession(
        sectionId,
        sessionId,
        name,
        passcode,
        weekNum,
        latitude,
        longitude
      );
      res.json({
        status: 201,
        message: `Session created`,
        data: session,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.post(
  "/:sectionId/:weekNum/:sessionId/:email/:passcode",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const email = req.params.email;
    const passcode = req.params.passcode;
    const latitude = req.body.latitude || 0;
    const longitude = req.body.longitude || 0;
    const distance = req.body.distance || 0;
    const token = req.body.token;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        const session = await courseDao.addStudentToSession(
          sectionId,
          weekNum,
          sessionId,
          email,
          passcode,
          latitude,
          longitude,
          distance
        );
        res.json({
          status: 200,
          message: `Student added`,
          data: session,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.post(
  "/:sectionId/:weekNum/:sessionId/:pollId",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const pollId = req.params.pollId;
    const token = req.body.token;
    const email = req.body.email;
    const startTimestamp = req.body.startTimestamp;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        let poll = await courseDao.addPollToSession(
          sectionId,
          weekNum,
          sessionId,
          pollId,
          startTimestamp
        );
        res.json({
          status: 200,
          message: `Poll added`,
          data: poll,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.put("/:sectionId/:weekNum/:sessionId/close", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const weekNum = req.params.weekNum;
  const sessionId = req.params.sessionId;
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
      const session = await courseDao.closeActiveSession(
        sectionId,
        weekNum,
        sessionId
      );
      res.json({
        status: 200,
        message: `Session closed`,
        data: session,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.put(
  "/:sectionId/:weekNum/:sessionId/:pollId/close",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const pollId = req.params.pollId;
    const name = req.body.name || "";
    const time = req.body.time || 0;
    const token = req.body.token;
    const email = req.body.email;
    const endTimestamp = req.body.endTimestamp;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        let poll = await courseDao.closeActivePoll(
          sectionId,
          weekNum,
          sessionId,
          pollId,
          name,
          endTimestamp
        );
        res.json({
          status: 200,
          message: `Poll closed`,
          data: poll,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.put("/:sectionId/:weekNum/closeAll", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const weekNum = req.params.weekNum;
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
      let course = await courseDao.closeAllSessions(sectionId, weekNum);
      res.json({
        status: 200,
        message: `Sessions closed`,
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.put(
  "/:sectionId/:weekNum/:sessionId/closeAll",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const token = req.body.token;
    const email = req.body.email;
    const endTimestamp = req.body.endTimestamp;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        let session = await courseDao.closeAllPolls(
          sectionId,
          weekNum,
          sessionId,
          endTimestamp
        );
        res.json({
          status: 200,
          message: `Polls closed`,
          data: session,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.patch("/:sectionId/:weekNum/:sessionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const weekNum = req.params.weekNum;
  const sessionId = req.params.sessionId;
  const name = req.body.name;
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
      let session = await courseDao.updateSession(
        sectionId,
        weekNum,
        sessionId,
        name
      );
      res.json({
        status: 200,
        message: `Session updated`,
        data: session,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.patch(
  "/:sectionId/:weekNum/:sessionId/:pollId",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const pollId = req.params.pollId;
    const email = req.body.email;
    const timestamp = req.body.timestamp;
    const response = req.body.response;
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
        let session = await courseDao.addResponseToPoll(
          sectionId,
          weekNum,
          sessionId,
          pollId,
          email,
          timestamp,
          response
        );
        res.json({
          status: 200,
          message: `Response added`,
          data: session,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.patch(
  "/:sectionId/:weekNum/:sessionId/:pollId/unknownClicker",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const pollId = req.params.pollId;
    const clickerId = req.body.clickerId;
    const timestamp = req.body.timestamp;
    const response = req.body.response;
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
        let poll = await courseDao.addClickerResponseToPoll(
          sectionId,
          weekNum,
          sessionId,
          pollId,
          clickerId,
          timestamp,
          response
        );
        res.json({
          status: 200,
          message: `Unknown Response added`,
          data: poll,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

Course.post("/", async (req, res, next) => {
  let sectionId = toSectionId(
    req.body.name + req.body.section + req.body.semester
  );
  req.body.sectionId = sectionId;
  const token = req.body.token;
  const email = req.body.instructor.email;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      let course = await courseDao.create(req.body);
      res.json({
        status: 201,
        message: "Course created",
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.put("/:sectionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const name = req.body.name;
  const section = req.body.section;
  const semester = req.body.semester;
  const newSisId = req.body.SISId;
  const passcode = req.body.passcode;
  const newSectionId = toSectionId(name + section + semester);
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
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.put("/:sectionId/:email", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const email = req.params.email;
  const name = req.body.name;
  const token = req.body.token;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const course = await courseDao.addStudentByEmail(sectionId, email, name);
      res.json({
        status: 200,
        message: "Student added to course",
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.delete("/:sectionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const token = req.headers.token;
  const email = req.headers.email;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const course = await courseDao.deleteBySectionId(sectionId);
      res.json({
        status: 200,
        message: "Course deleted",
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.delete("/:sectionId/:email", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const email = req.params.email;
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
      const course = await courseDao.removeStudentByEmail(sectionId, email);
      res.json({
        status: 200,
        message: "Student deleted from course",
        data: course,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.delete("/:sectionId/:weekNum/:sessionId", async (req, res, next) => {
  const sectionId = req.params.sectionId;
  const weekNum = req.params.weekNum;
  const sessionId = req.params.sessionId;
  const token = req.headers.token;
  const email = req.headers.email;
  try {
    const valid = await validateToken(token, email);
    if (!token || !valid) {
      res.json({
        status: 401,
        message: `Unauthorized Request`,
        data: null,
      });
    } else {
      const session = await courseDao.deleteSession(
        sectionId,
        weekNum,
        sessionId
      );
      res.json({
        status: 200,
        message: "Session deleted",
        data: session,
      });
    }
  } catch (err) {
    next(err);
  }
});

Course.delete(
  "/:sectionId/:weekNum/:sessionId/:pollId",
  async (req, res, next) => {
    const sectionId = req.params.sectionId;
    const weekNum = req.params.weekNum;
    const sessionId = req.params.sessionId;
    const pollId = req.params.pollId;
    const token = req.headers.token;
    const email = req.headers.email;
    try {
      const valid = await validateToken(token, email);
      if (!token || !valid) {
        res.json({
          status: 401,
          message: `Unauthorized Request`,
          data: null,
        });
      } else {
        const session = await courseDao.deletePoll(
          sectionId,
          weekNum,
          sessionId,
          pollId
        );
        res.json({
          status: 200,
          message: "Poll deleted",
          data: session,
        });
      }
    } catch (err) {
      next(err);
    }
  }
);

export default Course;
