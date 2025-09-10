import mongoose from "mongoose";

const idCounterSchema = new mongoose.Schema({
  currentId: {
    type: Number,
    required: true,
    default: 1001,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Add index for better performance
idCounterSchema.index({ currentId: 1 });

const IdCounter = mongoose.model("IdCounter", idCounterSchema);

export default IdCounter;
