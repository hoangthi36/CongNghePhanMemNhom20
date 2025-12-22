import mongoose from "mongoose";
import HouseHold from "./houseHoldModel.js";

const billItemSchema = new mongoose.Schema({
  //Chi so cu cua hoa don
  oldIndex: {
    type: Number,
    required: true,
  },
  //Chi so moi cua hoa don
  newIndex: {
    type: Number,
    required: true,
  },
  //Don gia cua hoa don
  unitPrice: {
    type: Number,
    required: true,
  },
  //So tien phai tra cho hoa don
  amount: {
    type: Number,
    required: true,
  },
  //Han nop tien hoa don
  dueDate: {
    type: Date,
    required: true,
  },
  //Ngay tao hoa don
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //Trang thai hoa don: da thanh toan hay chua
  status: {
    type: Boolean,
    default: false,
  },
  //Ngay thanh toan hoa don
  paidAt: {
    type: Date,
    required: false,
    default: null,
  },
});
const billSchema = new mongoose.Schema({
  houseHold: {
    type: mongoose.Schema.Types.ObjectId,
    ref: HouseHold,
    required: true,
  },
  //Loai hoa don: dien, nuoc, rac, khac
  type: {
    type: String,
    enum: ["electricity", "water", "garbage", "other"],
    required: true,
  },
  //Mo ta chi tiet hoa don
  descripption: {
    type: String,
    required: false,
  },
  billItem: [billItemSchema],
});

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
