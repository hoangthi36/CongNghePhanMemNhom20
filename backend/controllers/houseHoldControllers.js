import User from "../models/userModel.js";
import HouseHold from "../models/houseHoldModel.js";

// 1.Create a new household
export const createHouseHold = async (req, res) => {
  try {
    const { name, members, address } = req.body;
    const identification = req.user.identification;
    //Kem tra trung ten ho
    const existingHouseHold = await HouseHold.findOne({ namehousehold: name });
    if (existingHouseHold) {
      return res.status(400).json({ message: "Household name already exists" });
    }
    //Kiem tra user da thuoc household chua
    const userInfo = await User.findOne({ identification: identification });

    // dam bao chu ho da ton tai
    if (!userInfo) {
      return res.status(404).json({ message: "User not found" });
    }
    //Neu da thuoc ho gia dinh thi khong duoc tao nua
    if (userInfo.household) {
      return res
        .status(400)
        .json({ message: "You already belongs to a household" });
    }

    //Validate thanh vien(cai members duoc cung cap phai co trong he thong)
    if (members && !Array.isArray(members)) {
      return res.status(400).json({ message: "Members should be an array" });
    }
    //Tao ho gia dinh moi
    const newHouseHold = new HouseHold({
      namehousehold: name,
      address: address,
      namehead: userInfo.name,
      identification_head: userInfo.identification,
      members: members || [],
    });
    //Luu document moi vao database
    const savedHouseHold = await newHouseHold.save();
    // ***Chua xu ly duoc  doi sua sau***
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
export const updateHouseHold = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, members, address } = req.body;
    const userInfo = await User.findById(userId);
    if (!userInfo.household) {
      return res
        .status(404)
        .json({ message: "You do not belong to any household" });
    }
    const houseHoldInfo = await HouseHold.findById(userInfo.household);
    if (houseHoldInfo.namehead !== userInfo.name) {
      return res
        .status(403)
        .json({ message: "Only the head of household can update household" });
    }
    if (name) houseHoldInfo.namehousehold = name;
    if (address) houseHoldInfo.address = address;
    if (members) {
      if (!Array.isArray(members)) {
        return res.status(400).json({ message: "Members should be an array" });
      }
      houseHoldInfo.members = members;
    }
    const updatedHouseHold = await houseHoldInfo.save();
    res.status(200).json(updatedHouseHold);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//4.Delete household
export const deleteHouseHold = async (req, res) => {
  try {
    const userId = req.user._id;
    const userInfo = await User.findById(userId);
    //Kiem tra co phai chu ho khong
    if (!userInfo.household) {
      return res
        .status(404)
        .json({ message: "You do not belong to any household" });
    }
    //Chi chu ho moi duoc xoa ho gia dinh
    const houseHoldInfo = await HouseHold.findById(userInfo.household);
    if (houseHoldInfo.namehead !== userInfo.name) {
      return res
        .status(403)
        .json({ message: "Only the head of household can delete household" });
    }
    //Xoa household
    await HouseHold.findByIdAndDelete(userInfo.household);
    //Xoa household trong thong tin user
    await User.updateMany(
      { household: userInfo.household },
      { $unset: { household: "" } }
    );
    res.status(200).json({ message: "Household deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
