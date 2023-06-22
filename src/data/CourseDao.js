// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import ApiError from "../model/ApiError.js";
import Course from "../model/Course.js";
import {
  decodeEmail,
  encodeEmail,
  validateName,
  validateSectionId,
} from "../routes/courses.js";

class CourseDao {
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

  async createSession(
    sectionId,
    sessionId,
    name,
    passcode,
    weekNum,
    latitude,
    longitude
  ) {
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
      date: new Date().toLocaleDateString(),
      active: true,
      numPolls: 0,
      passcode: passcode,
      latitude: latitude,
      longitude: longitude,
      students: Object.create(null),
      polls: Object.create(null),
    });
    course.markModified("sessions");
    await course.save();
    return course.sessions.get(weekNum).get(sessionId);
  }

  async addStudentToSession(
    sectionId,
    weekNum,
    sessionId,
    email,
    passcode,
    latitude,
    longitude,
    distance
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
    if (session.passcode !== passcode) {
      throw new ApiError(401, `Incorrect passcode`);
    }
    session.students[encodeEmail(email)] = {
      latitude: latitude,
      longitude: longitude,
      distance: distance,
    };
    course.markModified("sessions");
    await course.save();
    return session;
  }

  async addPollToSession(
    sectionId,
    weekNum,
    sessionId,
    pollId,
    startTimestamp
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
    for (let id in session.polls) {
      if (session.polls[id].active) {
        session.polls[id].active = false;
      }
    }
    session.numPolls++;
    session.polls[pollId] = Object.create(null);
    session.polls[pollId].name = `Poll ${session.numPolls}`;
    session.polls[pollId].startTimestamp = startTimestamp;
    session.polls[pollId].endTimestamp = -1;
    session.polls[pollId].responses = new Map();
    session.polls[pollId].numResponses = 0;
    session.polls[pollId].active = true;
    session.polls[pollId].liveResults = new Map([
      ["A", 0],
      ["B", 0],
      ["C", 0],
      ["D", 0],
      ["E", 0],
    ]);
    course.markModified("sessions");
    await course.save();
    return session.polls[pollId];
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
    if (!session.polls[pollId].active) {
      throw new ApiError(403, `Cannot vote, poll has closed`);
    }
    let poll = session.polls[pollId];
    let responses = new Map(Object.entries(poll.responses));
    if (!responses.get(email)) {
      responses.set(email, Object.create(null));
      responses.get(email).finalAnswer = response;
      responses.get(email).answers = Object.create(null);
      poll.numResponses++;
    } else {
      poll.liveResults[response]++;
    }
    let answers = new Map(Object.entries(responses.get(email).answers));
    answers.set(timestamp, response);
    responses.get(email).answers = answers;
    responses.get(email).finalAnswer = response;
    poll.liveResults.set(response, poll.liveResults.get(response) + 1);
    poll.responses = responses;
    course.markModified("sessions");
    await course.save();
    return poll;
  }

  async addClickerResponseToPoll(
    sectionId,
    weekNum,
    sessionId,
    pollId,
    clickerId,
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
    if (!session.polls[pollId].active) {
      throw new ApiError(403, `Cannot vote, poll has closed`);
    }
    let poll = session.polls[pollId];
    let responses = new Map(Object.entries(poll.responses));
    if (!responses.get(clickerId)) {
      responses.set(clickerId, Object.create(null));
      responses.get(clickerId).finalAnswer = response;
      responses.get(clickerId).answers = Object.create(null);
      poll.numResponses++;
    } else {
      poll.liveResults[responses.get(clickerId).finalAnswer]--;
    }
    let answers = new Map(Object.entries(responses.get(clickerId).answers));
    answers.set(timestamp, response);
    responses.get(clickerId).answers = answers;
    responses.get(clickerId).finalAnswer = response;
    poll.liveResults[response]++;
    poll.responses = responses;
    course.markModified("sessions");
    await course.save();
    return poll;
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
    return session;
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
    return session;
  }

  async closeAllSessions(sectionId, weekNum) {
    const course = await Course.findOne({ sectionId: sectionId });
    if (!course) {
      throw new ApiError(404, `Course with section id ${sectionId} not found`);
    }
    const week = course.sessions.get(weekNum);
    const length = course.sessions.size;
    const keys = Array.from(course.sessions.keys());
    const prevKey = length > 1 ? keys[length - 2] : null;
    if (!week) {
      throw new ApiError(404, `Week ${weekNum} not found`);
    }
    for (const sessionId of week.keys()) {
      if (week.get(sessionId).active) {
        week.get(sessionId).active = false;
      }
    }
    if (prevKey) {
      for (const sessionId of course.sessions.get(prevKey).keys()) {
        if (course.sessions.get(prevKey).get(sessionId).active) {
          course.sessions.get(prevKey).get(sessionId).active = false;
        }
      }
    }
    course.markModified("sessions");
    await course.save();
    return course;
  }

  async closeActivePoll(
    sectionId,
    weekNum,
    sessionId,
    pollId,
    name,
    endTimestamp
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
    session.polls[pollId].active = false;
    if (session.polls[pollId].endTimestamp < 0) {
      session.polls[pollId].endTimestamp = endTimestamp;
    }
    if (name && name !== "") {
      session.polls[pollId].name = name;
    }
    course.markModified("sessions");
    await course.save();
    return session.polls[pollId];
  }

  async closeAllPolls(sectionId, weekNum, sessionId, endTimestamp) {
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
        session.polls[pollId].endTimestamp = endTimestamp;
      }
    }
    course.markModified("sessions");
    await course.save();
    return session;
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
    return session;
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
    session.numPolls--;
    course.markModified("sessions");
    await course.save();
    return session;
  }

  async create(course) {
    if (!validateSectionId(course.sectionId)) {
      throw new ApiError(
        400,
        `Invalid section id ${course.sectionId}. Must be in the format XXXX-XXX`
      );
    }
    const oldCourse = await Course.findOne({
      sectionId: { $eq: course.sectionId },
    });
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
    if (
      !validateSectionId(oldSectionId) ||
      !validateSectionId(newSectionId) ||
      !validateName(courseName) ||
      !validateSection(courseSection) ||
      !validateSemester(courseSemester) ||
      !validateSisId(newSisId) ||
      !validatePasscode(passcode)
    ) {
      throw new ApiError(400, "Invalid course information");
    }
    const oldCourse = await Course.findOneAndUpdate(
      { sectionId: oldSectionId },
      {
        sectionId: newSectionId,
        name: { $eq: courseName },
        section: { $eq: courseSection },
        semester: { $eq: courseSemester },
        sisId: { $eq: newSisId },
        passcode: { $eq: passcode },
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
    if (course.students.get(email)) {
      throw new ApiError(
        409,
        `Student with email ${decodeEmail(email)} already exists`
      );
    }
    course.students.set(email, name);
    await course.save();
    return course;
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
}

export default CourseDao;
