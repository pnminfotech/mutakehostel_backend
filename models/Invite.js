// // models/Invite.js  (CJS)
// const mongoose = require("mongoose");

// const InviteSchema = new mongoose.Schema(
//   {
//     token: { type: String, unique: true, index: true, required: true },

//     // optional prefill/lock data
//     name: String,
//     phoneNo: String,
//     roomNo: String,
//     bedNo: String,
//     baseRent: Number,
//     rentAmount: Number,
//     depositAmount: Number,

//     // bookkeeping
//     createdBy: { type: String }, // optional
//     expiresAt: {
//       type: Date,
//       default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//     },
//     usedAt: { type: Date, default: null },
//     usedByFormId: { type: mongoose.Schema.Types.ObjectId, ref: "Form" },
//   },
//   { timestamps: true }
// );

// // TTL for unused expired invites (usedAt=null)
// InviteSchema.index(
//   { expiresAt: 1 },
//   { expireAfterSeconds: 0, partialFilterExpression: { usedAt: null } }
// );

// module.exports = mongoose.model("Invite", InviteSchema);
// models/Invite.js
const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true, index: true, required: true },
    prefill: { type: mongoose.Schema.Types.Mixed, default: {} },
    usedAt: { type: Date, default: null },
    usedByFormId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invite', InviteSchema);
