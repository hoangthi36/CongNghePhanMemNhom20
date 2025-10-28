import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  identification: {
    type: String,
    required: true,
    unique: true,
  },
  householdId: {
    type: String,
    default: null,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
