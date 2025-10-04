// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  amount: { type: Number, required: true },
  month:  { type: Number },        // 0-11 (optional)
  year:   { type: Number },        // optional
  utr:    { type: String },        // UPI reference / UTR entered by tenant
  note:   { type: String },
  status: { type: String, enum: ['reported','confirmed','rejected'], default: 'reported' },
  paymentMode: { type: String, default: 'Online' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
