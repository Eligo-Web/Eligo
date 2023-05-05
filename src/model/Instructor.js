// Eligo is a web application primarily used for in-class polls.
// Copyright (C) 2023  Eligo-Web <smodare1@jhu.edu> <ffernan9@jhu.edu>

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
