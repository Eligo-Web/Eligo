import User from "../model/User.js";
import ApiError from "../model/ApiError.js";
import mongoose from "mongoose";
import { UserRole } from "../model/UserRole.js";

class UserDao {
  async readAll({ name, email, role }) {
    const filter = {};
    if (name) {
      filter.name = name;
    }
    if (email) {
      filter.email = email;
    }
    if (role) {
      filter.role = role;
    }
    const users = await User.find(filter);
    return users;
  }

  async read(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return user;
  }

  async create(user) {
    const newUser = new User(user);
    await newUser.save();
    return newUser;
  }

  async delete(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(404, `User with id ${id} not found`);
    }
    return user;
  }

  async deleteAll() {
    await User.deleteMany({});
  }
}

export default UserDao;
