import mongoose from "mongoose";
import { UserRole } from "./UserRole.js";

const StudentSchema = new mongoose.Schema({
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
    default: UserRole.Student,
  },
  history: {
    type: {},
    required: true,
    default: {},
  },
});

const Student = mongoose.model("Student", StudentSchema);

export default Student;
