import mongoose from "mongoose";
import { UserRole } from "./UserRole.js";

const UserSchema = new mongoose.Schema({
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
});

const User = mongoose.model("User", UserSchema);

export default User;
