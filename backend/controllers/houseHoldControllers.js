import User from "../models/userModel.js";
import HouseHold from "../models/houseHoldModel.js";
import mongoose from "mongoose";

// 1.Create a new household
export const createHouseHold = async (req, res) => {
  try {
    const { name, address, identification_head } = req.body;
    const identification = identification_head;

    // Kiểm tra trùng tên hộ
    const existingHouseHold = await HouseHold.findOne({ namehousehold: name });
    if (existingHouseHold) {
      return res.status(400).json({ message: "Household name already exists" });
    }

    // Đảm bảo chủ hộ đã tồn tại
    const userInfo = await User.findOne({ identification: identification });
    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }

    // Nếu đã thuộc hộ gia đình thì không được tạo nữa
    if (userInfo.household) {
      return res
        .status(400)
        .json({ message: "You already belong to a household" });
    }

    // Tạo hộ gia đình mới (chỉ có chủ hộ)
    const newHouseHold = new HouseHold({
      namehousehold: name,
      address: address,
      namehead: userInfo.name,
      identification_head: userInfo.identification,
    });

    // Lưu document mới vào database
    const savedHouseHold = await newHouseHold.save();

    // Cập nhật household cho chủ hộ
    await User.findByIdAndUpdate(userInfo._id, {
      household: savedHouseHold._id,
    });

    res.status(201).json(savedHouseHold);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//2.Read household By identification_head
export const getHouseHoldByHeadIdentification = async (req, res) => {
  try {
    const { identification_head } = req.params;
    const houseHoldInfo = await HouseHold.findOne({
      identification_head: identification_head,
    });
    if (!houseHoldInfo) {
      return res.status(404).json({ message: "Household not found" });
    }
    res.status(200).json(houseHoldInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all households (page 50 items per page)
export const getAllHouseHolds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const houseHolds = await HouseHold.find().skip(skip).limit(limit);
    res.status(200).json(houseHolds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//3.Update household
// Thêm 1 thành viên(admin )

export const addMemberToHouseHold = async (req, res) => {
  try {
    // API /household/add-member
    const { houseHoldId, identification, relationship, name } = req.body;

    // 1. Kiểm tra household có tồn tại không
    const houseHoldInfo = await HouseHold.findById(houseHoldId);
    if (!houseHoldInfo) {
      return res.status(404).json({ message: "Household not found" });
    }

    // 2. Tìm user theo CCCD (identification) thay vì newMemberId
    const newMember = await User.findOne({ identification });
    if (!newMember) {
      return res
        .status(404)
        .json({ message: "User not found with this identification" });
    }

    // 3. Kiểm tra user đã thuộc household khác chưa
    if (newMember.householdId) {
      return res.status(400).json({
        message: "User already belongs to another household",
      });
    }

    // 4. Gán householdId cho member
    newMember.householdId = houseHoldId;
    await newMember.save();

    // 5. Thêm vào mảng members của household
    houseHoldInfo.members.push({
      _id: newMember._id, // Dùng _id từ newMember tìm được
      name: name || newMember.name,
      identification: identification || newMember.identification,
      relationship: relationship,
    });
    await houseHoldInfo.save();

    res.status(200).json({
      message: "Member added successfully",
      household: {
        id: houseHoldInfo._id,
        identification_head: houseHoldInfo.identification_head,
      },
      newMember: {
        id: newMember._id,
        name: name || newMember.name,
        relationship: relationship,
        identification: identification || newMember.identification,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// xóa 1 cháu khỏi hộ (cũng admin)

export const removeMemberFromHouseHold = async (req, res) => {
  try {
    const { identification } = req.body;

    // 1. Tìm user theo CCCD
    const memberToRemove = await User.findOne({ identification });
    if (!memberToRemove) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Tìm household theo identification trong members
    const houseHoldInfo = await HouseHold.findOne({
      members: { $elemMatch: { identification } },
    });

    if (!houseHoldInfo) {
      return res
        .status(404)
        .json({ message: "User not found in any household" });
    }

    // 3. Không cho xóa chủ hộ
    if (memberToRemove.identification === houseHoldInfo.identification_head) {
      return res.status(400).json({
        message: "Cannot remove head of household",
      });
    }

    // 4. Xóa householdId khỏi User (sử dụng $unset để xóa field hoàn toàn)
    await User.findByIdAndUpdate(memberToRemove._id, {
      $unset: { householdId: "", household: "" }, // Xóa cả householdId và household nếu có
    });

    // 5. Xóa khỏi household.members
    houseHoldInfo.members = houseHoldInfo.members.filter(
      (m) => m.identification !== identification
    );
    await houseHoldInfo.save();

    res.json({
      message: "Member removed successfully",
      removedMember: memberToRemove.name,
      household: houseHoldInfo.namehousehold,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//4.Delete household
// Xóa sạch household và cập nhật thông tin user
export const deleteHouseHold = async (req, res) => {
  try {
    const { householdId } = req.params;

    // Kiểm tra household có tồn tại không
    const houseHoldInfo = await HouseHold.findById(householdId);
    if (!houseHoldInfo) {
      return res.status(404).json({ message: "Household not found" });
    }

    // Đếm số thành viên trong hộ
    const memberCount = await User.countDocuments({
      household: householdId,
    });

    // Cập nhật householdId thành null trong thông tin user TRƯỚC
    await User.updateMany(
      { householdId: householdId },
      { $set: { householdId: null } }
    );

    // Xóa household SAU khi đã cập nhật user
    await HouseHold.findByIdAndDelete(householdId);

    res.status(200).json({
      message: "Household deleted successfully",
      householdName: houseHoldInfo.namehead,
      affectedMembers: memberCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xử lý khi chủ hộ bị xóa hoặc rời khỏi hộ

export const handleHeadRemoval = async (req, res) => {
  try {
    const { householdId } = req.params;
    const houseHoldInfo = await HouseHold.findById(householdId);

    if (!houseHoldInfo) {
      return res.status(404).json({ message: "Household not found" });
    }

    // 1. Tìm chủ hộ hiện tại trong members
    const currentHeadIndex = houseHoldInfo.members.findIndex(
      (member) => member.identification === houseHoldInfo.identification_head
    );

    if (currentHeadIndex === -1) {
      return res.status(404).json({ message: "Current head not found" });
    }

    // 2. Lấy thành viên còn lại
    const remainingMembers = houseHoldInfo.members.filter(
      (_, index) => index !== currentHeadIndex
    );

    if (remainingMembers.length === 0) {
      // Xóa hộ trống + xóa householdId của chủ hộ cuối
      await User.findOneAndUpdate(
        { identification: houseHoldInfo.identification_head },
        { $unset: { householdId: "" } }
      );
      await HouseHold.findByIdAndDelete(householdId);
      return res.status(200).json({
        message: "Household deleted - no members remaining",
      });
    }

    // 3. ✅ XÓA householdId của CHỦ HỘ CŨ trong User collection
    await User.findOneAndUpdate(
      { identification: houseHoldInfo.identification_head },
      { $unset: { householdId: "" } } // ← QUAN TRỌNG
    );

    // 4. Chuyển quyền cho thành viên còn lại
    const newHead = remainingMembers[0];
    await HouseHold.findByIdAndUpdate(householdId, {
      namehead: newHead.name,
      identification_head: newHead.identification,
      members: remainingMembers.map((member) => ({
        ...member,
        relationship:
          member.name === newHead.name ? "Chủ" : member.relationship,
      })),
    });

    res.status(200).json({
      message: "Household head transferred successfully",
      oldHead: houseHoldInfo.namehead,
      newHead: newHead.name,
      oldHeadHouseholdIdRemoved: true, // Xác nhận đã xóa
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//5. Thông kê số hộ gia đình

export const getHouseHoldStatistics = async (req, res) => {
  try {
    const totalHouseholds = await HouseHold.countDocuments();

    res.status(200).json({
      message: "Total households retrieved successfully",
      totalHouseholds: totalHouseholds,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
