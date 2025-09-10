import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String, required: true },
  type: { type: String, enum: ["video", "document"], default: "document" }
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, required: true },
    instructor: { type: String, required: true },
    status: { type: String, enum: ["active", "draft"], default: "draft" },
    thumbnail: { type: String },
    resources: [resourceSchema],
    fees: { type: Number, default: 100 }, // Add this line (fee in INR)
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

