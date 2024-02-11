import { Schema, model } from "mongoose";

// Define the User schema
const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  points: {
    type: Number,
    default: 10,
  },
});

const User = model("User", userSchema);

export default User;
