import express from "express";
import UserDao from "../data/UserDao";

const router = express.Router();
export const userDao = new UserDao();
