import Course from "../model/Course.js";
import ApiError from "../model/ApiError.js";
import mongoose from "mongoose";

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
    newSisId
  ) {
    const oldCourse = await Course.findOneAndUpdate(
      { sectionId: oldSectionId },
      {
        sectionId: newSectionId,
        name: courseName,
        section: courseSection,
        semester: courseSemester,
        SISId: newSisId,
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

  async addStudent(id, studentId) {
    Course.findByIdAndUpdate(
      id,
      { $push: { students: studentId } },
      { new: true }
    );
  }

  async removeStudent(id, studentId) {
    Course.findByIdAndUpdate(
      id,
      { $pull: { students: studentId } },
      { new: true }
    );
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
