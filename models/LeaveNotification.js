// models/LeaveNotification.js
const mongoose = require("mongoose");

const LeaveNotificationSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["leave_request"], default: "leave_request" },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveRequest",
      required: true,
      index: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",        // ✅ matches your main tenant model
      required: true,
      index: true,
    },
    tenantName: { type: String, default: "" },
    leaveDate: { type: Date, required: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.LeaveNotification
  || mongoose.model("LeaveNotification", LeaveNotificationSchema);
