import mongoose from "mongoose";
import { UserRole } from "./UserRole.js";

const InstructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: UserRole.Instructor,
  },
  history: {
    type: Map,
    of: [String],
    required: true,
    default: {},
  },
  dateJoined: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Instructor = mongoose.model("Instructor", InstructorSchema);

export default Instructor;
