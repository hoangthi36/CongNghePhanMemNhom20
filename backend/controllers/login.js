import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  try {
    const { identification, password } = req.body;

    // 1. Kiểm tra nhập đủ thông tin chưa
    if (!identification || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập identification và password",
      });
    }

    // 2. Tìm user theo identification
    const user = await User.findOne({ identification }).populate("householdId");

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword === user.password) {
      return res.status(401).json({
        message: "Thông tin đăng nhập không đúng",
      });
    }

    // 4. Đăng nhập thành công
    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user._id,
        identification: user.identification,
        name: user.name,
        householdId: user.householdId?._id || null, // THÊM dòng này
        household: user.householdId
          ? {
              // THÊM block này
              name: user.householdId.namehousehold,
              address: user.householdId.address,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};
