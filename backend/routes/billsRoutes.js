import {
  createBill,
  getBillsByType,
  getPaidBillsByHousehold,
  getUnpaidBillsByHousehold,
  getAllBills,
  getPaidBills,
  getUnpaidBills,
  getBillsByCreatedDate,
  updateBill,
  deleteBillsByType,
  deleteBillByIdentification_head,
} from "../controllers/billControllers.js";
import express from "express";
const router = express.Router();

//I.Create bill
router.post("/create-bill", createBill);
//II.Read bills
//1.---Đọc tất cả hóa đơn theo loại phí
router.get("/bills/type/:type", getBillsByType);
//2.---Đọc tất cả hóa đơn đã thanh toán của 1 hộ dân
router.get(
  "/bills/paid/household/:identification_head",
  getPaidBillsByHousehold
);
//3.---Đọc tất cả hóa đơn chưa thanh toán của 1 hộ dân
router.get(
  "/bills/unpaid/household/:identification_head",
  getUnpaidBillsByHousehold
);
//4.---Đọc tất cả hóa đơn (quyền admin)
router.get("/bills/all", getAllBills);
//5.---Đọc tất cả hóa đơn đã thanh toán (quyền admin)
router.get("/bills/paid", getPaidBills);
//6.---Đọc tất cả hóa đơn chưa thanh toán (quyền admin)
router.get("/bills/unpaid", getUnpaidBills);
//7.---Đọc tất cả hóa đơn theo khoảng ngày tạo (quyền admin)
router.get("/bills/created-date", getBillsByCreatedDate);
//III.Update bill
router.patch("/update-bill/:billId", updateBill);
//IV.Delete bill
//1.---Xóa hóa đơn theo loại 1 phí
router.delete("/bills/type/:type", deleteBillsByType);
//2.---Xóa 1 hóa đơn của hộ dân theo loại phí
router.delete(
  "/bills/household/:identification_head/type/:type",
  deleteBillByIdentification_head
);
export default router;
