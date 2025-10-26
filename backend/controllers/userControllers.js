import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

// User cập nhật thông tin cá nhân
export const updateUserProfile = async (req, res) => {
  try {
    const {
      identification,
      name,
      phone,
      address,
      dob,
      currentPassword,
      newPassword,
    } = req.body;

    // Kiểm tra identification
    if (!identification) {
      return res.status(400).json({ message: "Identification is required" });
    }

    // Tìm user
    const user = await User.findOne({ identification: identification });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cập nhật thông tin cơ bản
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dob) user.dob = dob;

    // Đổi mật khẩu (nếu có)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to change password",
        });
      }

      // Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      // Hash mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Lưu vào database
    const updatedUser = await user.save();

    // Trả về kết quả
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        identification: updatedUser.identification,
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address,
        dob: updatedUser.dob,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User lấy thông tin cá nhân

// User xem thông tin của chính mình (đã login)
// Lấy thông tin user qua body
export const getMyProfile = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: {
        _id: user._id,
        identification: user.identification,
        name: user.name,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        household: user.household,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};