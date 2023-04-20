import ApiError from "../model/ApiError.js";
import Instructor from "../model/Instructor.js";

class InstructorDao {
  async readAll({ name, email, role }) {
    const filter = {};
    if (name) {
      filter.name = name.toLowerCase();
    }
    if (email) {
      filter.email = email.toLowerCase();
    }
    if (role) {
      filter.role = role;
    }
    const instructors = await Instructor.find(filter);
    return instructors;
  }

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

  async updateLastLogin(email, token) {
    const instructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (!instructor) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    instructor.lastLogin = new Date();
    instructor.token = token;
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
