import express from "express";
import UserDao from "../data/UserDao";
import ApiError from "../model/ApiError";

const router = express.Router();
export const userDao = new UserDao();
