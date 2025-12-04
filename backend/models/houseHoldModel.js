import mongoose from "mongoose";

const memberschema = mongoose.Schema({
  identification: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },
});

const houseHoldschema = mongoose.Schema({
  namehousehold: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  namehead: {
    type: String, // ten chu ho
    required: true,
  },

  identification_head: {
    type: String,
    required: true,
  },
  members: [memberschema],
});

houseHoldschema.index({ identification_head: 1 }, { unique: true });

const HouseHold = mongoose.model("HouseHold", houseHoldschema);

export default HouseHold;
