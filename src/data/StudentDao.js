import Student from "../model/Student.js";
import ApiError from "../model/ApiError.js";
import mongoose from "mongoose";
import { UserRole } from "../model/UserRole.js";

class StudentDao {
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

  async readByEmail(email) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    return student;
  }

  async create(student) {
    const newStudent = new Student(student);
    await newStudent.save();
    return newStudent;
  }

  async addToHistory(email, newSemester, newCourse) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    student.history[newSemester].push(newCourse);
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

  async deleteAll() {
    await Student.deleteMany({});
  }
}

export default StudentDao;
