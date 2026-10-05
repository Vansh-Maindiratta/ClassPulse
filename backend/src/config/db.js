import mongoose from "mongoose";

export async function connectDb(uri) {
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri);
  console.log("MongoDB Atlas connected successfully");
}

export function logDbFailure() {
  console.error(
    "Unable to connect to MongoDB Atlas.\nCheck your MONGODB_URI and Atlas Network Access settings."
  );
}
