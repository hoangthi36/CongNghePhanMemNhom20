import HouseHold from "../models/houseHoldModel.js";
import Bill from "../models/bill.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";

const ELECTRIC_UNIT_PRICE = 3000;
const WATER_UNIT_PRICE = 15000;
const GARBAGE_UNIT_PRICE = 25000;
const MANAGEMENT_UNIT_PRICE = 100000;
const PARKING_UNIT_PRICE = 70000;

// 1. Admin tạo hóa đơn
export const createBill = async (req, res) => {
  try {
    const { identification_head, type, oldIndex, newIndex, dueDate } = req.body;

    const household = await HouseHold.findOne({ identification_head });
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    let unitPrice = 0;
    let amount = 0;
    let billItem = {};

    switch (type) {
      case "electricity":
      case "water":
        if (!oldIndex || !newIndex || newIndex <= oldIndex) {
          return res.status(400).json({ message: "Invalid meter index" });
        }
        unitPrice =
          type === "electricity" ? ELECTRIC_UNIT_PRICE : WATER_UNIT_PRICE;
        amount = (newIndex - oldIndex) * unitPrice;
        billItem = { oldIndex, newIndex, unitPrice, amount, dueDate };
        break;

      case "garbage":
        unitPrice = GARBAGE_UNIT_PRICE;
        amount = unitPrice;
        billItem = { oldIndex: 0, newIndex: 0, unitPrice, amount, dueDate };
        break;

      case "management":
        unitPrice = MANAGEMENT_UNIT_PRICE;
        amount = unitPrice;
        billItem = { oldIndex: 0, newIndex: 0, unitPrice, amount, dueDate };
        break;

      case "parking":
        unitPrice = PARKING_UNIT_PRICE;
        amount = unitPrice;
        billItem = { oldIndex: 0, newIndex: 0, unitPrice, amount, dueDate };
        break;

      default:
        return res.status(400).json({ message: "Invalid bill type" });
    }

    const newBill = new Bill({
      houseHold: household._id,
      type,
      billItem: [billItem],
    });

    await newBill.save();

    res.status(201).json({
      message: "Bill created successfully",
      bill: newBill,
    });
  } catch (error) {
    console.error("Create bill error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. household xem tất cả hóa đơn của nhà mình
export const getAllBillsByHousehold = async (req, res) => {
  try {
    const { identification_head } = req.params;

    const household = await HouseHold.findOne({ identification_head });
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    const bills = await Bill.find({ houseHold: household._id })
      .populate("houseHold", "namehousehold identification_head address")
      .sort({ "billItem.createdAt": -1 });

    res.status(200).json({
      household: {
        id: household._id,
        name: household.namehousehold,
        identification_head: household.identification_head,
      },
      total: bills.length,
      bills,
    });
  } catch (error) {
    console.error("Get bills error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Admin xem tất cả hóa đơn của chung cư
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("houseHold", "namehousehold identification_head address")
      .sort({ "billItem.createdAt": -1 });

    res.status(200).json({
      total: bills.length,
      bills,
    });
  } catch (error) {
    console.error("Get all bills error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 4. Update trạng thái của bill item

export const updateBillItemStatus = async (req, res) => {
  try {
    const { billId, billItemId } = req.params;
    const { status } = req.body;

    // Kiểm tra billId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({ message: "Invalid bill ID format" });
    }

    // Kiểm tra billItemId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(billItemId)) {
      return res.status(400).json({ message: "Invalid bill item ID format" });
    }

    // Kiểm tra status phải là boolean
    if (typeof status !== "boolean") {
      return res.status(400).json({
        message: "Status must be true (paid) or false (unpaid)",
      });
    }

    // Tìm bill
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Tìm bill item trong mảng billItem
    const billItem = bill.billItem.id(billItemId);
    if (!billItem) {
      return res.status(404).json({ message: "Bill item not found" });
    }

    // Cập nhật status
    billItem.status = status;

    // Nếu thanh toán (status = true), lưu ngày thanh toán
    if (status === true) {
      billItem.paidAt = new Date();
    } else {
      // Nếu đổi lại thành chưa thanh toán, xóa ngày thanh toán
      billItem.paidAt = null;
    }

    // Lưu lại bill
    await bill.save();

    // Populate household info
    await bill.populate(
      "houseHold",
      "namehousehold identification_head address"
    );

    res.status(200).json({
      message: "Bill item status updated successfully",
      bill: bill,
    });
  } catch (error) {
    console.error("Update bill item status error:", error);
    res.status(500).json({ message: error.message });
  }
};

5; // Thống kê chi tiết 1 tháng cụ thể
export const getSpecificMonthRevenue = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Kiểm tra phải có cả year và month
    if (!year || !month) {
      return res.status(400).json({
        message:
          "Please provide both year and month parameters (e.g., ?year=2026&month=12)",
      });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validate month (1-12)
    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        message: "Month must be between 1 and 12",
      });
    }

    const result = await Bill.aggregate([
      {
        $unwind: "$billItem",
      },
      {
        $match: {
          "billItem.status": true, // Chỉ bill đã thanh toán
          $expr: {
            $and: [
              { $eq: [{ $year: "$billItem.createdAt" }, yearNum] },
              { $eq: [{ $month: "$billItem.createdAt" }, monthNum] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$billItem.amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Tính tổng chung
    const grandTotal = result.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalBills = result.reduce((sum, item) => sum + item.count, 0);

    // Format breakdown theo loại hóa đơn
    const breakdown = result.map((item) => ({
      type: item._id,
      totalAmount: item.totalAmount,
      count: item.count,
    }));

    res.status(200).json({
      message: `Revenue for ${monthNum}/${yearNum} calculated successfully`,
      period: {
        year: yearNum,
        month: monthNum,
      },
      summary: {
        totalRevenue: grandTotal,
        totalBills: totalBills,
      },
      breakdown: breakdown,
    });
  } catch (error) {
    console.error("Get specific month revenue error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 6. Đếm số hộ có hóa đơn chưa thanh toán ít nhát 1 hóa đơn
export const countHouseholdsWithUnpaidBills = async (req, res) => {
  try {
    const { year, month } = req.query;

    let matchCondition = {
      "billItem.status": false,
    };

    if (year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          message: "Month must be between 1 and 12",
        });
      }

      matchCondition.$expr = {
        $and: [
          { $eq: [{ $year: "$billItem.createdAt" }, yearNum] },
          { $eq: [{ $month: "$billItem.createdAt" }, monthNum] },
        ],
      };
    }

    const result = await Bill.aggregate([
      { $unwind: "$billItem" },
      { $match: matchCondition },
      { $group: { _id: "$houseHold" } },
      { $count: "totalHouseholds" },
    ]);

    const count = result[0]?.totalHouseholds || 0;

    res.status(200).json({
      message: "Count retrieved successfully",
      period:
        year && month
          ? { year: parseInt(year), month: parseInt(month) }
          : "All time",
      totalHouseholdsWithUnpaidBills: count,
    });
  } catch (error) {
    console.error("Count unpaid households error:", error);
    res.status(500).json({ message: error.message });
  }
};

//7. User xem hóa đơn bằng householdId
export const getBillsByHouseholdId = async (req, res) => {
  try {
    //Vd API: /user/:userId/bills (GET /user/64b8f0c2e1d3f2a5c6b7d8e9/bills)
    const { userId } = req.params; // ✅ CHỈ cần userId

    // 1. Lấy user → TỰ ĐỘNG lấy householdId
    const user = await User.findById(userId).populate("householdId");
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // 2. Lấy householdId từ user
    const householdId = user.householdId;
    if (!householdId) {
      return res.status(400).json({ message: "User chưa thuộc household nào" });
    }

    // 3. Check household tồn tại
    const household = await HouseHold.findById(householdId);
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    // 4. Lấy bills của household
    const bills = await Bill.find({ houseHold: householdId })
      .populate("houseHold", "namehousehold identification_head address")
      .sort({ "billItem.createdAt": -1 });

    res.status(200).json({
      message: "Bills retrieved successfully",
      household: {
        id: household._id,
        name: household.namehousehold,
        address: household.address,
        namehead: household.namehead,
      },
      total: bills.length,
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
