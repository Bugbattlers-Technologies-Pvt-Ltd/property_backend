const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aadhar: { type: String, required: true },
  address: { type: String },
  role: { type: String },
  photo: { type: String }, // base64 or URL
  approvalStatus: {
    type: String,
    enum: ["on-hold", "approved", "rejected"],
    default: "on-hold",
  },
}, { timestamps: true });

module.exports = mongoose.model("Agent", agentSchema);
