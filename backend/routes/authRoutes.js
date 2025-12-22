import express from "express";
import { registerUser } from "../controllers/registerUser.js";
import { login } from "../controllers/login.js";
const router = express.Router();

//I.Register user
router.post("/register", registerUser);
//II.Login user
router.post("/login", login);
export default router;
