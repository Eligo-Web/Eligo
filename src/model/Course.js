import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  instructor: {
    type: Map,
    of: String,
    required: true,
    default: {},
  },
  section: {
    type: String,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
    unique: true,
  },
  students: {
    type: Map,
    of: String,
    required: true,
    default: {},
  },
  passcode: {
    type: String,
    required: true,
    unique: true,
  },
  semester: {
    type: String,
    required: true,
  },
  sessions: {
    type: Map,
    of: Map,
    required: true,
    default: {},
  },
  SISId: {
    type: String,
  },
});

const Course = mongoose.model("Course", CourseSchema);

export default Course;
