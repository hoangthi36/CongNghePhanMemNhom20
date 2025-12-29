import express from "express";
import {
  updateUserProfile,
  getMyProfile,
} from "../controllers/userControllers.js";

const router = express.Router();

router.patch("/update-profile", updateUserProfile);
router.get("/my-profile", getMyProfile);
export default router;
