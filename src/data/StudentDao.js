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
import Student from "../model/Student.js";

class StudentDao {
  async read(id) {
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return student;
  }

  async readByEmail(email) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    return student;
  }

  async readByClickerIdInCourse(semester, sectionId, clickerId) {
    const students = await Student.find({ clickerId: clickerId });
    for (const student of students) {
      if (student.history.has(semester)) {
        if (student.history.get(semester).includes(sectionId)) {
          return student;
        }
      }
    }
    throw new ApiError(
      404,
      `User with clickerId ${clickerId} in course ${sectionId} not found`
    );
  }

  async create(student) {
    const newStudent = new Student(student);
    await newStudent.save();
    return newStudent;
  }

  async addToHistory(email, newCourse, newSemester) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    if (!student.history.has(newSemester)) {
      student.history.set(newSemester, []);
    }
    if (student.history.get(newSemester).includes(newCourse)) {
      throw new ApiError(409, `Course ${newCourse} already exists in history`);
    }
    student.history.get(newSemester).push(newCourse);
    await student.save();
    return student;
  }

  async updateHistory(
    email,
    oldSemester,
    newSemester,
    oldSectionId,
    newSectionId
  ) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    const oldSectionIds = student.history.get(oldSemester);
    const index = oldSectionIds.indexOf(oldSectionId);
    if (index > -1) {
      oldSectionIds.splice(index, 1);
    }
    if (!student.history.has(newSemester)) {
      student.history.set(newSemester, []);
    }
    student.history.get(newSemester).push(newSectionId);
    await student.save();
    return student;
  }

  async updateClickerId(email, clickerId) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    student.clickerId = clickerId;
    await student.save();
    return student;
  }

  async deleteClickerId(email) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    student.clickerId = "";
    await student.save();
    return student;
  }

  async delete(id) {
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return student;
  }

  async deleteByEmail(email) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    await student.delete();
    return student;
  }

  async deleteFromHistory(email, semester, sectionId) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    if (!student.history.has(semester)) {
      throw new ApiError(404, `Semester ${semester} not found`);
    }
    const sectionIds = student.history.get(semester);
    const index = sectionIds.indexOf(sectionId);
    if (index > -1) {
      sectionIds.splice(index, 1);
    } else {
      throw new ApiError(404, `Section ${sectionId} not found`);
    }
    await student.save();
    return student;
  }

  async deleteAll() {
    await Student.deleteMany({});
  }
}

export default StudentDao;
