import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    houseHold: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HouseHold",
      required: true,
    },
    //So tien da thanh toan
    amountPaid: {
      type: Number,
      required: true,
    },
    //Kieu thanh toan: tien mat, the tin dung, chuyen khoan ngan hang, thanh toan di dong
    method: {
      type: String,
      enum: ["cash", "credit_card", "bank_transfer", "mobile_payment"],
    },
    //Thoi gian thanh toan
    paidAt: {
      type: Date,
      default: Date.now,
    },
    //Trang thai giao dich: thanh cong, that bai, dang xu ly
    status: {
      type: String,
      enum: ["successful", "failed", "processing"],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
