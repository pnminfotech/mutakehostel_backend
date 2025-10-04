

// const mongoose = require('mongoose');

// const formSchema = new mongoose.Schema(
//   {
//     srNo: { type: Number, unique: true, required: true },

//     name: { type: String, required: true },
//     joiningDate: { type: Date, required: true },
//     roomNo: { type: String },
//     depositAmount: { type: Number, required: true },
//     address: { type: String, required: true },
//     phoneNo: { type: Number, required: true },
//     relativeAddress1: { type: String },
//     relativeAddress2: { type: String },
//     floorNo: { type: String },
//     bedNo: { type: String },
//     companyAddress: { type: String },
//     dateOfJoiningCollege: { type: Date, required: true },
//     dob: { type: Date, required: true },

//     baseRent: { type: Number },
//     rents: [
//       {
//         rentAmount: { type: Number },
//         date: { type: Date },
//         month: { type: String },
//         paymentMode: {
//       type: String,
//       enum: ["Cash", "Online"],
//       default: "Cash"
//     }
//       },
//     ],

//     leaveDate: { type: String },

//     // ✅ Updated: supports both legacy disk URLs and DB-backed files
//     documents: [
//       {
//         fileName: { type: String },

//         // legacy (disk) link — keep for old records
//         url: { type: String },

//         // NEW: DB-backed fields (DocumentFile model)
//         fileId: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentFile" },
//         contentType: { type: String },
//         size: { type: Number },

//         relation: {
//           type: String,
//           enum: ["Self", "Father", "Mother", "Husband"],
//           default: "Self",
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Form', formSchema);









// models/formModels.js
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
    srNo: { type: Number, unique: true, required: true },

    name: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    roomNo: { type: String },
    depositAmount: { type: Number, required: true },
    address: { type: String, required: true },
    phoneNo: { type: Number, required: true },
    relativeAddress1: { type: String },
    relativeAddress2: { type: String },
    floorNo: { type: String },
    bedNo: { type: String },
    companyAddress: { type: String },
    dateOfJoiningCollege: { type: Date, required: true },
    dob: { type: Date, required: true },

    baseRent: { type: Number },
   rents: [
  {
    rentAmount: { type: Number },
    date: { type: Date },                 // month anchor (1st of month)
    month: { type: String },              // keep if you still use it
    paymentMode: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash"
    },
    // ✅ add these (used by approvals)
    paymentDate: { type: Date },
    utr: { type: String },
    note: { type: String },
  },
],


    leaveDate: { type: String },

    // NEW/OPTIONAL fields used by the tenant routes
    email: { type: String },
    emergencyContact: { type: String },
    avatarUrl: { type: String },

    // Tenant-initiated leave request (admin can confirm separately)
    leaveRequestDate: { type: Date },

    // eKYC bundle
    ekyc: {
      status: { type: String, enum: ["not_started", "pending", "verified", "rejected"], default: "not_started" },
      aadhaarLast4: { type: String },
      panLast4: { type: String },
      selfieUrl: { type: String },
      docs: [
        {
          fileName: String,
          url: String,
          contentType: String,
          size: Number,
          relation: { type: String, default: "Self" },
        }
      ]
    },

    // ✅ Your existing DOCUMENTS array (keep as-is)
    documents: [
      {
        fileName: { type: String },
        url: { type: String },
        fileId: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentFile" },
        contentType: { type: String },
        size: { type: Number },
        relation: {
          type: String,
          enum: ["Self", "Father", "Mother", "Husband"],
          default: "Self",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Form', formSchema);
