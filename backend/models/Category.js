import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: String,
  count: { type: Number, default: 0 },
});

export default mongoose.model("Category", categorySchema);
