// mongodb.js
import { connect } from "mongoose";

async function UserDB() {
  try {
    const client = await connect(process.env.DATABASE_USERS);
    console.log("Connected successfully to MongoDB server");
    return client;
  } catch (err) {
    console.error("Error occurred while connecting to MongoDB:", err);
    throw err;
  }
}

export default UserDB;
