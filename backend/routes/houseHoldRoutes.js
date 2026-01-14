import {
  createHouseHold,
  addMemberToHouseHold,
  getHouseHoldByHeadIdentification,
  getAllHouseHolds,
  deleteHouseHold,
  removeMemberFromHouseHold,
  handleHeadRemoval,
  getHouseHoldStatistics,
} from "../controllers/houseHoldControllers.js";
import express from "express";

const router = express.Router();
//I.Create household
router.post("/create-household", createHouseHold);
//II.Update household
router.patch("/add-member", addMemberToHouseHold);
router.patch("/remove-member", removeMemberFromHouseHold);
//III.Read household
//1.Read household By identification_head
router.get(
  "/read-household/:identification_head",
  getHouseHoldByHeadIdentification
);
//2.Get all households (paginated)
router.get("/all-households", getAllHouseHolds);
//IIII. Delete household (only head of household allowed)
router.delete("/delete-household/:householdId", deleteHouseHold);
router.delete("/handle-head-removal/:householdId", handleHeadRemoval);
//V. Get household statistics
router.get("/statistics", getHouseHoldStatistics);
export default router;
