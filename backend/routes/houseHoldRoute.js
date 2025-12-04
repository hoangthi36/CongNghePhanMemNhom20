import {
  createHouseHold,
  updateHouseHold,
  getHouseHoldByHeadIdentification,
} from "../controllers/houseHoldControllers.js";
import express from "express";

const router = express.Router();

router.post("/create-household", createHouseHold);
router.patch("/update-hosehold", updateHouseHold);
router.get(
  "/read-household/:identification_head",
  getHouseHoldByHeadIdentification
);
export default router;
