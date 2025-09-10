import mongoose from "mongoose";

const deferralRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  batch: { type: String },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
});

export default mongoose.models.DeferralRequest ||
  mongoose.model("DeferralRequest", deferralRequestSchema);
