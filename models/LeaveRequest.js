// const mongoose = require("mongoose");

// const leaveRequestSchema = new mongoose.Schema({
//   tenant: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   leaveDate: { type: Date, required: true },
//   note: { type: String, trim: true },
//   status: {
//     type: String,
//     enum: ["pending", "approved", "rejected", "cancelled"],
//     default: "pending",
//   },
//   requestedAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);


// models/LeaveRequest.js
const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  leaveDate: { type: Date, required: true },
  note: { type: String, trim: true },
  status: { type: String, enum: ["pending","approved","rejected","cancelled"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
