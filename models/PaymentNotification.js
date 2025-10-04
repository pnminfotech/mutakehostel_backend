const mongoose = require("mongoose");

const PaymentNotificationSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true }, // your tenant collection
    tenantName: String,
    roomNo: String,
    bedNo: String,

    // what tenant reported
    amount: { type: Number, required: true },
    month: Number, // 1-12
    year: Number,
    utr: String,
    note: String,

    // workflow
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    read: { type: Boolean, default: false },

    // optional: link to a real payment record
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentNotification", PaymentNotificationSchema);
