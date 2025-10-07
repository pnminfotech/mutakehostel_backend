

const mongoose = require("mongoose");

const LeaveRequestSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    tenantName: { type: String },                 // denormalized for quick admin view (optional)
    leaveDate: { type: Date, required: true },
    note: { type: String, default: "" },

    // pending → approved/rejected → (optional) canceled
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "canceled"],
      default: "pending",
      index: true,
    },

    // audit trail
    requestedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date },                    // set when approved/rejected/canceled
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelReason: { type: String },               // optional admin comment
  },
  { timestamps: true }
);

// Allow only ONE active (pending/approved) request per tenant.
LeaveRequestSchema.index(
  { tenant: 1, status: 1 },
  { partialFilterExpression: { status: { $in: ["pending", "approved"] } }, unique: true }
);

module.exports = mongoose.model("LeaveRequest", LeaveRequestSchema);
