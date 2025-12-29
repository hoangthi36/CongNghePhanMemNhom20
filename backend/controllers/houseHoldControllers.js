import User from "../models/userModel.js";
import HouseHold from "../models/houseHoldModel.js";

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
    const { houseHoldId, newMemberId, relationship, identification, name } =
      req.body;

    // 1. Kiểm tra household có tồn tại không
    const houseHoldInfo = await HouseHold.findById(houseHoldId);
    if (!houseHoldInfo) {
      return res.status(404).json({ message: "Household not found" });
    }

    // 2. Kiểm tra user muốn thêm có tồn tại không
    const newMember = await User.findById(newMemberId);
    if (!newMember) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Kiểm tra user đã thuộc hộ nào chưa
    if (newMember.household) {
      return res.status(400).json({
        message: "User already belongs to another household",
      });
    }

    // 4. Thêm user vào hộ
    newMember.household = houseHoldId;
    await newMember.save();

    // 5. Thêm vào mảng members của household với đầy đủ thông tin
    if (houseHoldInfo.members) {
      houseHoldInfo.members.push({
        _id: newMemberId,
        name: name || newMember.name, // Ưu tiên name từ request, fallback sang name từ User
        identification: identification,
        relationship: relationship,
      });
      await houseHoldInfo.save();
    }

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
        identification: identification,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// xóa 1 cháu khỏi hộ (cũng admin)

export const removeMemberFromHouseHold = async (req, res) => {
  try {
    const { memberId } = req.body; // hoặc req.params

    // Kiểm tra member có tồn tại không
    const memberToRemove = await User.findById(memberId);
    if (!memberToRemove) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Kiểm tra member có thuộc hộ nào không
    if (!memberToRemove.household) {
      return res
        .status(400)
        .json({ message: "This user does not belong to any household" });
    }

    const houseHoldInfo = await HouseHold.findById(memberToRemove.household);

    // Không cho phép xóa chủ hộ
    if (houseHoldInfo && memberToRemove.name === houseHoldInfo.namehead) {
      return res.status(400).json({
        message:
          "Cannot remove the head of household. Please transfer ownership first or delete the household.",
      });
    }

    // Lưu thông tin để trả về
    const householdId = memberToRemove.household;
    const memberName = memberToRemove.name;

    // Xóa household khỏi member
    await User.findByIdAndUpdate(memberId, {
      $unset: { household: "" },
    });

    // Xóa khỏi array members nếu có
    if (
      houseHoldInfo &&
      houseHoldInfo.members &&
      Array.isArray(houseHoldInfo.members)
    ) {
      houseHoldInfo.members = houseHoldInfo.members.filter(
        (m) => m.toString() !== memberId.toString()
      );
      await houseHoldInfo.save();
    }

    res.status(200).json({
      message: "Member removed successfully",
      removedMember: memberName,
      household: houseHoldInfo?.namehead,
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

    // Xóa household
    await HouseHold.findByIdAndDelete(householdId);

    // Xóa household trong thông tin user
    await User.updateMany(
      { household: householdId },
      { $unset: { household: "" } }
    );

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
      return res.status(404).json({
        message: "Household not found",
      });
    }

    // Tìm tất cả thành viên còn lại (trừ chủ hộ cũ)
    const remainingMembers = await User.find({
      household: householdId,
      name: { $ne: houseHoldInfo.namehead },
    }).sort({ createdAt: 1 });

    if (remainingMembers.length === 0) {
      // Không còn thành viên nào -> Xóa hộ
      await HouseHold.findByIdAndDelete(householdId);
      return res.status(200).json({
        message: "Household deleted - no members remaining",
        deletedHousehold: houseHoldInfo.namehead,
      });
    }

    // Có thành viên còn lại -> Chuyển quyền cho người đầu tiên
    const newHead = remainingMembers[0];
    await HouseHold.findByIdAndUpdate(householdId, {
      namehead: newHead.name,
    });

    res.status(200).json({
      message: "Household head transferred successfully",
      oldHead: houseHoldInfo.namehead,
      newHead: newHead.name,
      remainingMembers: remainingMembers.length,
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
