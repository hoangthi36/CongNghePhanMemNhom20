import {
  createHouseHold,
  updateHouseHold,
  getHouseHoldByHeadIdentification,
  getAllHouseHolds,
  deleteHouseHold,
} from "../controllers/houseHoldControllers.js";
import express from "express";

const router = express.Router();
//I.Create household
router.post("/create-household", createHouseHold);
//II.Update household
router.patch("/update-household", updateHouseHold);
//III.Read household
//1.Read household By identification_head
router.get(
  "/read-household/:identification_head",
  getHouseHoldByHeadIdentification
);
//2.Get all households (paginated)
router.get("/all-households", getAllHouseHolds);
//III. Delete household (only head of household allowed)
router.delete("/delete-household", deleteHouseHold);
export default router;
