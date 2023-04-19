import ApiError from "../model/ApiError.js";
import Student from "../model/Student.js";

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

  async updateLastLogin(email, token) {
    const student = await Student.findOne({ email: email.toLowerCase() });
    if (!student) {
      throw new ApiError(404, `User with email ${email} not found`);
    }
    student.lastLogin = new Date();
    student.token = token;
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
