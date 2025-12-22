import HouseHold from "../models/houseHoldModel.js";
import Bill from "../models/bill.js";

// I.Create bill

export const createBill = async (req, res) => {
  try {
    const { Identification_head, amount, dueDate } = req.body;

    // Verify household exists
    const household = await HouseHold.findOne({
      identification_head: Identification_head,
    });
    // Kiem tra ho gia dinh ton tai
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }
    //Tao hoa don moi
    const newBill = new Bill({
      Identification_head,
      amount,
      dueDate,
      status: "unpaid",
    });
    const savedBill = await newBill.save();
    res.status(201).json(savedBill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// II.Read bills
/*--------------USER------------------*/

//1.---Đọc 1 hóa đơn theo 1 loại phí

export const getBillsByType = async (req, res) => {
  try {
    const { identification_head, type } = req.params;
    const page = parseInt(req.query.page) || 1; // trang hiện tại, mặc định 1
    const limit = 10; // 10 hóa đơn 1 trang
    const skip = (page - 1) * limit;

    //Tìm household theo identification_head
    const household = await HouseHold.findOne({
      identification_head: identification_head,
    });

    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    //Lấy danh sách hóa đơn theo loại phí + phân trang
    const bills = await Bill.find({
      houseHold: household._id,
      type: type,
    })
      .sort({ "billItem.createdAt": -1 }) // mới nhất lên trước
      .skip(skip)
      .limit(limit);

    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: "No bills found for this type" });
    }

    //Trả về
    res.status(200).json({
      page,
      limit,
      total: bills.length,
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//2.---Đọc tất cả hóa đơn đã thanh toán của 1 hộ dân

export const getPaidBillsByHousehold = async (req, res) => {
  try {
    const { identification_head } = req.params;
    const page = parseInt(req.query.page) || 1; // trang hiện tại, mặc định 1
    const limit = parseInt(req.query.limit) || 10; // số hóa đơn/trang, mặc định 10
    const skip = (page - 1) * limit;

    //Tìm household theo identification_head
    const household = await HouseHold.findOne({
      identification_head: identification_head,
    });

    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    //Query hóa đơn đã thanh toán
    const bills = await Bill.find({
      houseHold: household._id,
      "billItem.status": true, // chỉ lấy billItem đã thanh toán
    })
      .sort({ "billItem.paidAt": -1 }) // sắp xếp theo ngày thanh toán mới nhất
      .skip(skip)
      .limit(limit);

    if (!bills || bills.length === 0) {
      return res
        .status(404)
        .json({ message: "No paid bills found for this household" });
    }

    //Đếm tổng số hóa đơn đã thanh toán (để frontend hiển thị số trang)
    const totalPaid = await Bill.countDocuments({
      houseHold: household._id,
      "billItem.status": true,
    });

    res.status(200).json({
      page,
      limit,
      totalPaid,
      totalPages: Math.ceil(totalPaid / limit),
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//3.---Đọc tất cả hóa đơn chưa thanh toán của 1 hộ dân

export const getUnpaidBillsByHousehold = async (req, res) => {
  try {
    const { identification_head } = req.params;
    const page = parseInt(req.query.page) || 1; // trang hiện tại, mặc định 1
    const limit = parseInt(req.query.limit) || 10; // số hóa đơn/trang, mặc định 10
    const skip = (page - 1) * limit;

    //Tìm household theo identification_head
    const household = await HouseHold.findOne({
      identification_head: identification_head,
    });

    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    //Query hóa đơn chưa thanh toán
    const bills = await Bill.find({
      houseHold: household._id,
      "billItem.status": false, // chỉ lấy billItem chưa thanh toán
    })
      .sort({ "billItem.createdAt": -1 }) // sắp xếp theo ngày tạo hóa đơn, mới nhất lên trước
      .skip(skip)
      .limit(limit);

    if (!bills || bills.length === 0) {
      return res
        .status(404)
        .json({ message: "No unpaid bills found for this household" });
    }

    //Đếm tổng số hóa đơn chưa thanh toán
    const totalUnpaid = await Bill.countDocuments({
      houseHold: household._id,
      "billItem.status": false,
    });

    res.status(200).json({
      page,
      limit,
      totalUnpaid,
      totalPages: Math.ceil(totalUnpaid / limit),
      bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*--------------ADMIN------------------*/
//1.---Tất cả hóa đơn

export const getAllBills = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Lấy toàn bộ hóa đơn, phân trang
    const bills = await Bill.find()
      .skip(skip)
      .limit(limit)
      .populate("houseHold"); // Lấy thông tin hộ dân

    const totalBills = await Bill.countDocuments();

    res.status(200).json({
      page,
      totalPages: Math.ceil(totalBills / limit),
      totalItems: totalBills,
      items: bills,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//2.---Tất cả hóa đơn đã thanh toán sắp xếp theo ngày thanh toán

export const getPaidBills = async (req, res) => {
  try {
    const { identification_head } = req.query;

    const query = {
      "billItem.status": true, // chỉ lấy hóa đơn đã thanh toán
    };

    // Nếu có identification_head → lấy đúng household đó
    if (identification_head) {
      const household = await HouseHold.findOne({ identification_head });

      if (!household) {
        return res.status(404).json({ message: "Household not found" });
      }

      query.houseHold = household._id; // (từ id_head->tìm được household -> lấy _id)
    }

    // Tìm bills + sắp theo ngày thanh toán gần nhất
    const paidBills = await Bill.find(query)
      .populate("houseHold")
      .sort({ "billItem.paidAt": -1 }); // ngày nộp mới nhất lên đầu

    return res.status(200).json(paidBills);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//3.---Tất cả hóa đơn chưa thanh toán sắp xếp theo ngày tạo

export const getUnpaidBills = async (req, res) => {
  try {
    const { identification_head } = req.query;

    if (!identification_head) {
      return res
        .status(400)
        .json({ message: "identification_head is required" });
    }

    const household = await HouseHold.findOne({ identification_head });
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    const unpaidBills = await Bill.find({
      houseHold: household._id,
      "billItem.status": false,
    })
      .populate({
        path: "houseHold",
        select: "namehousehold address namehead identification_head members",
      })
      .sort({ "billItem.createdAt": -1 }); // sắp xếp theo ngày tạo mới nhất
    //billItem ở đâu???

    res.status(200).json(unpaidBills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

//4.---Truy vấn theo ngày tạo

export const getBillsByCreatedDate = async (req, res) => {
  try {
    const {
      identification_head,
      type,
      page = 1,
      limit = 10,
      sort = "desc", // mặc định mới nhất
    } = req.query;

    const query = {};

    // Nếu truyền identification_head → tìm household trước
    if (identification_head) {
      const household = await HouseHold.findOne({ identification_head });

      if (!household) {
        return res.status(404).json({
          message: "Household not found",
        });
      }

      query.houseHold = household._id;
    }

    // Lọc theo loại phí (nếu có)
    if (type) {
      query.type = type;
    }

    // Sort: desc = mới nhất, asc = cũ nhất
    const sortOption = {
      "billItem.createdAt": sort === "asc" ? 1 : -1, //điều_kiện ? giá_trị_đúng : giá_trị_sai
    };

    const bills = await Bill.find(query)
      .populate("houseHold") // lấy thông tin hộ
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      total: bills.length,
      page: Number(page),
      bills,
    });
  } catch (err) {
    console.error("Error fetching bills:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//III.Update bill
//1.---Sửa giá trị và hạn nộp của hóa đơn

export const updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { unitPrice, amount, dueDate } = req.body;
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    if (unitPrice !== undefined) bill.unitPrice = unitPrice;
    if (amount !== undefined) bill.amount = amount;
    if (dueDate !== undefined) bill.dueDate = dueDate;
    const updatedBill = await bill.save();
    res.status(200).json(updatedBill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//IV.Delete bill
//1.---Xóa hóa đơn theo loại 1 phí
export const deleteBillsByType = async (req, res) => {
  try {
    const { type } = req.params;

    // Xoá tất cả hoá đơn có type tương ứng
    const result = await Bill.deleteMany({ type });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: `No bills of type '${type}' found to delete`,
      });
    }

    res.status(200).json({
      message: `Admin deleted ${result.deletedCount} bill(s) of type '${type}'`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//2.---Xóa 1 hóa đơn của hộ dân theo loại phí

export const deleteBillByIdentification_head = async (req, res) => {
  try {
    const { identification_head, type } = req.params;

    //Tìm household theo identification_head
    const household = await HouseHold.findOne({
      identification_head: identification_head,
    });
    if (!household) {
      return res.status(404).json({ message: "Household not found" });
    }

    //Xóa hóa đơn theo loại phí
    const deletedBill = await Bill.findOneAndDelete({
      houseHold: household._id,
      type: type,
    });

    if (!deletedBill) {
      return res
        .status(404)
        .json({ message: "Bill of this type not found for the household" });
    }
    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
