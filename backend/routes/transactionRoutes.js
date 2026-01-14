import {
  createTransaction,
  getTransactionsByHousehold,
  adminTotalRevenue,
  adminRevenueByType,
} from "../controllers/transactionControllers.js";
import express from "express";
const router = express.Router();
//I.Create transaction
router.post("/create-transaction", createTransaction);
//II.Read transactions
//1.---Xem giao dich theo houseHold
router.get("/transactions/household/:houseHoldId", getTransactionsByHousehold);
//III.Admin analytics
//1.---Tong doanh thu
router.get("/admin/transactions/total-revenue", adminTotalRevenue);
//2.---Doanh thu theo loai hoa don
router.get("/admin/transactions/revenue-by-type", adminRevenueByType);
export default router;
