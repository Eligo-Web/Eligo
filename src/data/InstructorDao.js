import Instructor from "../model/Instructor.js";
import ApiError from "../model/ApiError.js";
import mongoose from "mongoose";
import { UserRole } from "../model/UserRole.js";

class InstructorDao {
  async readAll({ name, email, role }) {
    const filter = {};
    if (name) {
      filter.name = name;
    }
    if (email) {
      filter.email = email;
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
    const instructor = await Instructor.findOne({ email: email });
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

  async addToHistory(email, newSemester, newCourse) {
    const instructor = readByEmail(email);
    instructor.history[newSemester].push(newCourse);
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
    const instructor = await Instructor.findOneAndDelete({ email: email });
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
