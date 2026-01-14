import express from "express";
import {
  createBill,
  getAllBillsByHousehold,
  getAllBills,
  updateBillItemStatus,
  getSpecificMonthRevenue,
  countHouseholdsWithUnpaidBills,
  getBillsByHouseholdId,
} from "../controllers/billControllers.js";

const router = express.Router();

// User route
router.get("/households/:identification_head/bills", getAllBillsByHousehold);
router.get("/user/:userId/bills", getBillsByHouseholdId);
// Admin routes
router.post("/create-bill", createBill);
router.get("/get-bills", getAllBills);
router.patch("/update-bill-item/:billId/:billItemId", updateBillItemStatus);
router.get("/revenue/specific-month", getSpecificMonthRevenue);
router.get("/count-unpaid-households", countHouseholdsWithUnpaidBills);

export default router;
