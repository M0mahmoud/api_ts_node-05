import { Schema, model } from "mongoose";

// Define the User schema
const CallSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 5,
  },
});

const Call = model("Call", CallSchema);

export default Call;
