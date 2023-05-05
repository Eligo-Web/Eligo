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
