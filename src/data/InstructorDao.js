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
import Instructor from "../model/Instructor.js";

class InstructorDao {
  async read(id) {
    const instructor = await Instructor.findById(id);
    if (!instructor) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return instructor;
  }

  async readByEmail(email) {
    const instructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (!instructor) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    return instructor;
  }

  async create(instructor) {
    const newInstructor = new Instructor(instructor);
    await newInstructor.save();
    return newInstructor;
  }

  async addToHistory(email, newSemester, sectionId) {
    const instructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (!instructor) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    let semester = instructor.history.get(newSemester);
    if (!semester) {
      instructor.history.set(newSemester, []);
      semester = instructor.history.get(newSemester);
    }
    semester.push(sectionId);
    await instructor.save();
    return instructor;
  }

  async updateHistory(
    email,
    oldSemester,
    newSemester,
    oldSectionId,
    newSectionId
  ) {
    const instructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (!instructor) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    const oldSectionIds = instructor.history.get(oldSemester);
    const index = oldSectionIds.indexOf(oldSectionId);
    if (index > -1) {
      oldSectionIds.splice(index, 1);
    }
    if (!instructor.history.has(newSemester)) {
      instructor.history.set(newSemester, []);
    }
    instructor.history.get(newSemester).push(newSectionId);
    await instructor.save();
    return instructor;
  }

  async deleteFromHistory(email, semester, sectionId) {
    const instructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (!instructor) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    const sectionIds = instructor.history.get(semester);
    const index = sectionIds.indexOf(sectionId);
    if (index > -1) {
      sectionIds.splice(index, 1);
    }
    await instructor.save();
    return instructor;
  }

  async delete(id) {
    const instructor = await Instructor.findByIdAndDelete(id);
    if (!instructor) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return instructor;
  }

  async deleteByEmail(email) {
    const instructor = await Instructor.findOneAndDelete({
      email: email.toLowerCase(),
    });
    if (!instructor) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    return instructor;
  }

  async deleteAll() {
    await Instructor.deleteMany({});
  }
}

export default InstructorDao;
