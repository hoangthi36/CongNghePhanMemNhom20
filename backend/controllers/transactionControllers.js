import HouseHold from "../models/houseHoldModel.js";
import Transaction from "../models/Transaction.js";
import Bill from "../models/bill.js";

//I.Create transaction
//1.---Tao giao dich + cap nhat hoa don
export const createTransaction = async (req, res) => {
  try {
    const { billId, houseHoldId, billItemIndex, amountPaid, method } = req.body;

    // 1. Kiểm tra bill & household
    const bill = await Bill.findById(billId);
    const houseHold = await HouseHold.findById(houseHoldId);

    if (!bill || !houseHold) {
      return res.status(404).json({
        message: "Bill or household not found",
      });
    }

    // 2. Kiểm tra billItem
    const item = bill.billItem[billItemIndex];
    if (!item) {
      return res.status(400).json({
        message: "Invalid billItem index",
      });
    }

    if (item.status === true) {
      return res.status(400).json({
        message: "This bill item has already been paid",
      });
    }

    // 3. Kiểm tra số tiền
    if (amountPaid < item.amount) {
      return res.status(400).json({
        message: "Amount paid is not enough",
      });
    }

    // 4. Tạo transaction
    const transaction = new Transaction({
      bill: billId,
      houseHold: houseHoldId,
      billItemIndex,
      amountPaid,
      method,
    });

    await transaction.save();

    // 5. Cập nhật billItem
    item.status = true;
    item.paidAt = new Date();

    await bill.save();

    res.status(201).json({
      message: "Payment successful",
      transaction,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//II.Read transactions

//1.---Lay danh sach giao dich theo household

export const getTransactionsByHousehold = async (req, res) => {
  try {
    const { identification_head } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // 1. Tìm household
    const household = await HouseHold.findOne({ identification_head });
    if (!household) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    // 2. Lấy giao dịch
    const transactions = await Transaction.find({
      houseHold: household._id,
    })
      .populate("bill", "type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({
      houseHold: household._id,
    });

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//III.Admin analytics
// 1.---Thong ke tong so tien da thu

export const adminTotalRevenue = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amountPaid" },
        },
      },
    ]);

    res.status(200).json({
      totalRevenue: result[0]?.totalAmount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2.---Thong ke so tien da thu theo loai hoa don

export const adminRevenueByType = async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      {
        $lookup: {
          from: "bills",
          localField: "bill",
          foreignField: "_id",
          as: "billInfo",
        },
      },
      { $unwind: "$billInfo" },
      {
        $group: {
          _id: "$billInfo.type",
          totalAmount: { $sum: "$amountPaid" },
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
