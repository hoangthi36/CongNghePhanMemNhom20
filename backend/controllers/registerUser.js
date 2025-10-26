import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import HouseHold from "../models/houseHoldModel.js";

export const registerUser = async (req, res) => {
  try {
    const { identification, name, password, dob, address } = req.body;

    // 1. Kiểm tra dữ liệu bắt buộc
    if (!identification || !name || !password) {
      return res.status(400).json({
        message: "Identification, name and password are required", // cung cấp đầy đủ thông tin
      });
    }

    // 2. Kiểm tra CCCD đã tồn tại chưa
    const existingUser = await User.findOne({ identification });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this identification", // CCCD đã tồn tại
      });
    }

    // 3. Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Tạo user mới
    const newUser = new User({
      identification,
      name,
      password: hashedPassword,
      dob,
      address,
      householdId: null,
    });

    await newUser.save();

    // 5. Trả kết quả
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        identification: newUser.identification,
        name: newUser.name,
        household: newUser.household || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
