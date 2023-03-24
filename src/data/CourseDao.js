import Course from "../model/Course.js";
import ApiError from "../model/ApiError.js";
import mongoose from "mongoose";
import { encodeEmail } from "../routes/courses.js";

class CourseDao {
  async readAll({ name, instructor, section, semester }) {
    const filter = {};
    if (name) {
      filter.name = name;
    }
    if (instructor) {
      filter.instructor = instructor;
    }
    if (section) {
      filter.section = section;
    }
    if (semester) {
      filter.semester = semester;
    }
    const courses = await Course.find(filter);
    return courses;
  }

  async read(id) {
    const course = await Course.findById(id);
    if (!course) {
      throw new ApiError(404, `Course with id ${id} not found`);
    }
    return course;
  }

  async readBySectionId(sectionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    return course;
  }

  async readByPasscode(passcode) {
    const course = await Course.findOne({ passcode: passcode });
    if (!course) {
      throw new ApiError(404, `Course with passcode ${passcode} not found`);
    }
    return course;
  }

  async readSession(sectionId, weekNum, sessionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    return session;
  }

  async readAllSessions(sectionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    return course.sessions;
  }

  async readPoll(sectionId, weekNum, sessionId, pollId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    const poll = session.polls[pollId];
    if (!poll) {
      throw new ApiError(404, `Poll with id ${pollId} not found`);
    }
    return poll;
  }

  async createSession(sectionId, sessionId, name, passcode, weekNum) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    if (!course.sessions.get(weekNum)) {
      if (course.sessions.size > 0) {
        const latestWeek = Array.from(course.sessions.keys()).pop();
        for (const sessionId of course.sessions.get(latestWeek).keys()) {
          course.sessions.get(latestWeek).get(sessionId).active = false;
        }
      }
      course.sessions.set(weekNum, new Map());
    }
    if (course.sessions.get(weekNum).get(sessionId)) {
      throw new ApiError(409, `Session with id ${sessionId} already exists`);
    }
    course.sessions.get(weekNum).set(sessionId, {
      name: name,
      active: true,
      numPolls: 0,
      passcode: passcode,
      students: [],
      polls: {},
    });
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async addStudentToSession(sectionId, weekNum, sessionId, email, passcode) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    if (session.passcode !== passcode) {
      throw new ApiError(401, `Incorrect passcode`);
    }
    session.students.push(email);
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async addPollToSession(sectionId, weekNum, sessionId, pollId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    for (let id in session.polls) {
      if (session.polls[id].active) {
        session.polls[id].active = false;
      }
    }
    session.numPolls += 1;
    session.polls[pollId] = {};
    session.polls[pollId].name = `Poll ${session.numPolls}`;
    session.polls[pollId].responses = new Map();
    session.polls[pollId].active = true;
    session.polls[pollId].liveResults = new Map([ ["A", 0], ["B", 0], ["C", 0], ["D", 0], ["E", 0] ]);

    course.markModified("sessions");
    await course.save();
    return course;
  }

  async addResponseToPoll(
    sectionId,
    weekNum,
    sessionId,
    pollId,
    email,
    timestamp,
    response
  ) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    if (!session.polls[pollId]) {
      throw new ApiError(404, `Poll with id ${pollId} not found`);
    }
    let poll = session.polls[pollId];
    let responses = new Map(Object.entries(poll.responses));
    if (!responses.get(email)) {
      responses.set(email, {});
      responses.get(email).finalAnswer = response;
      responses.get(email).answers = {};
    } else {
      poll.liveResults[responses.get(email).finalAnswer] -= 1;
    }
    let answers = new Map(Object.entries(responses.get(email).answers));
    answers.set(timestamp, response);
    responses.get(email).answers = answers;
    responses.get(email).finalAnswer = response;
    poll.liveResults[response] += 1;
    poll.responses = responses;
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async readActiveSession(sectionId, weekNum) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    let activeSession = null;
    let activeSessionId = null;
    for (const sessionId of week.keys()) {
      if (week.get(sessionId).active) {
        activeSession = week.get(sessionId);
        activeSessionId = sessionId;
        break;
      }
    }
    if (!activeSession) {
      throw new ApiError(404, `No active session found`);
    }
    return { activeSession, activeSessionId };
  }

  async readActivePoll(sectionId, weekNum, sessionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    let activePoll = null;
    let activePollId = null;
    for (const pollId of Object.keys(session.polls)) {
      if (session.polls[pollId].active) {
        activePoll = session.polls[pollId];
        activePollId = pollId;
        break;
      }
    }
    if (!activePoll) {
      throw new ApiError(404, `No active poll found`);
    }
    return { activePoll, activePollId };
  }

  async updateSession(sectionId, weekNum, sessionId, name) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    session.name = name;
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async closeActiveSession(sectionId, weekNum, sessionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    session.active = false;
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async closeAllSessions(sectionId, weekNum) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    for (const sessionId of week.keys()) {
      if (week.get(sessionId).active) {
        week.get(sessionId).active = false;
      }
    }
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async closeActivePoll(sectionId, weekNum, sessionId, pollId, name) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    if (!session.polls[pollId]) {
      throw new ApiError(404, `Poll with id ${pollId} not found`);
    }
    session.polls[pollId].active = false;
    if (name && name !== "") {
      session.polls[pollId].name = name;
    }
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async closeAllPolls(sectionId, weekNum, sessionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    for (const pollId of Object.keys(session.polls)) {
      if (session.polls[pollId].active) {
        session.polls[pollId].active = false;
      }
    }
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async deleteSession(sectionId, weekNum, sessionId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    week.delete(sessionId);
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async deletePoll(sectionId, weekNum, sessionId, pollId) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    const session = week.get(sessionId);
    if (!session) {
      throw new ApiError(404, `Session with id ${sessionId} not found`);
    }
    if (!session.polls[pollId]) {
      throw new ApiError(404, `Poll with id ${pollId} not found`);
    }
    delete session.polls[pollId];
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async create(course) {
    const oldCourse = await Course.findOne({ sectionId: course.sectionId });
    if (oldCourse) {
      throw new ApiError(
        409,
        `Course with section id ${course.sectionId} already exists`
      );
    }
    const newCourse = new Course(course);
    await newCourse.save();
    return newCourse;
  }

  async delete(id) {
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      throw new ApiError(404, `Course with id ${id} not found`);
    }
    return course;
  }

  async deleteBySectionId(sectionId) {
    const course = await Course.findOneAndDelete({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    return course;
  }

  async deleteAll() {
    await Course.deleteMany({});
  }

  async update(
    oldSectionId,
    newSectionId,
    courseName,
    courseSection,
    courseSemester,
    newSisId,
    passcode
  ) {
    const oldCourse = await Course.findOneAndUpdate(
      { sectionId: oldSectionId },
      {
        sectionId: newSectionId,
        name: courseName,
        section: courseSection,
        semester: courseSemester,
        SISId: newSisId,
        passcode: passcode,
      },
      { new: true }
    );
    if (!oldCourse) {
      throw new ApiError(
        404,
        `Course with section id ${oldSectionId} not found`
      );
    }
    return oldCourse;
  }

  async addStudentByEmail(sectionId, email, name) {
    email = encodeEmail(email);
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    if (course.students[email]) {
      throw new ApiError(409, `Student with email ${email} already exists`);
    }
    course.students.set(email, name);
    await course.save();
    return course;
  }

  async removeStudent(id, studentId) {
    Course.findByIdAndUpdate(
      id,
      { $pull: { students: studentId } },
      { new: true }
    );
  }

  async removeStudentByEmail(sectionId, email) {
    email = encodeEmail(email);
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    course.students.delete(email);
    await course.save();
    return course;
  }

  async addInstructor(id, instructorId) {
    Course.findByIdAndUpdate(
      id,
      { $push: { instructors: instructorId } },
      { new: true }
    );
  }

  async removeInstructor(id, instructorId) {
    Course.findByIdAndUpdate(
      id,
      { $pull: { instructors: instructorId } },
      { new: true }
    );
  }
}

export default CourseDao;
