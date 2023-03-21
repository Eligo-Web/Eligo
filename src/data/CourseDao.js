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
