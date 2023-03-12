import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  instructor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      //required: true,
    },
  ],
  section: {
    type: String,
    required: true,
  },
  sectionId: {
    type: String,
    required: true,
    unique: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  passcode: {
    type: String,
    //required: true,
  },
  semester: {
    type: String,
    //required: true,
  },
  sessions: {
    type: Map,
    //required: true,
    default: {},
  },
  SISId: {
    type: String,
    //required: true,
  },
});

const Course = mongoose.model("Course", CourseSchema);

export default Course;
