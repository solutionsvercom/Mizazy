import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

async function startMemoryServer() {
  memoryServer = await MongoMemoryServer.create();
  const memUri = memoryServer.getUri();
  await mongoose.connect(memUri);
  console.log("MongoDB memory server started (no local MongoDB found)");
  return { mode: "memory", uri: memUri };
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  const isLocalUri = !uri || /localhost|127\.0\.0\.1/.test(uri);

  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB connected:", uri.replace(/\/\/.*@/, "//***@"));
      return { mode: "atlas", uri };
    } catch (err) {
      if (!isLocalUri) throw err;
      console.warn("Could not connect to MONGODB_URI, falling back to in-memory MongoDB");
      console.warn(err.message);
      return startMemoryServer();
    }
  }

  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/mizazy");
    console.log("MongoDB connected: mongodb://127.0.0.1:27017/mizazy");
    return { mode: "local", uri: "mongodb://127.0.0.1:27017/mizazy" };
  } catch {
    return startMemoryServer();
  }
}
