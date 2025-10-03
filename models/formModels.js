// models/formModels.js
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    srNo: { type: Number, unique: true, required: true },

    name: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    roomNo: { type: String },
    depositAmount: { type: Number, required: true },

    // main address stays
    address: { type: String, required: true },

    phoneNo: { type: Number, required: true },

    // ⛔ removed address text fields for relatives as per your request
    // relativeAddress1: { type: String },
    // relativeAddress2: { type: String },

    // ✅ NEW: relative contact triplets (relation + name + phone)
    relative1Relation: {
      type: String,
      enum: ["Self", "Sister", "Brother", "Father", "Husband", "Mother"],
      default: "Self",
    },
    relative1Name:  { type: String, default: "" },
    relative1Phone: { type: String, default: "" },

    relative2Relation: {
      type: String,
      enum: ["Self", "Sister", "Brother", "Father", "Husband", "Mother"],
      default: "Self",
    },
    relative2Name:  { type: String, default: "" },
    relative2Phone: { type: String, default: "" },

    floorNo: { type: String },
    bedNo: { type: String },
    companyAddress: { type: String },
    dateOfJoiningCollege: { type: Date, required: true },
    dob: { type: Date, required: true },

    baseRent: { type: Number },
    rents: [
      {
        rentAmount: { type: Number },
        date: { type: Date },
        month: { type: String },
        paymentMode: {
          type: String,
          enum: ["Cash", "Online"],
          default: "Cash",
        },
      },
    ],

    leaveDate: { type: String },

    // documents (unchanged)
    documents: [
      {
        fileName: { type: String },
        url: { type: String }, // legacy
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentFile" },
        contentType: { type: String },
        size: { type: Number },
        relation: {
          type: String,
          enum: ["Self", "Father", "Mother", "Husband","Sister","Brother"],
          default: "Self",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', formSchema);
