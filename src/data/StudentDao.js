import Student from "../model/Student.js";
import ApiError from "../model/ApiError.js";
import mongoose from "mongoose";
import { UserRole } from "../model/UserRole.js";

class StudentDao {
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
    const students = await Student.find(filter);
    return students;
  }

  async read(id) {
    const student = await Student.findById(id);
    if (!student) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return student;
  }

  async create(student) {
    const newStudent = new Student(student);
    await newStudent.save();
    return newStudent;
  }

  async delete(id) {
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return student;
  }

  async deleteAll() {
    await Student.deleteMany({});
  }
}

export default StudentDao;
