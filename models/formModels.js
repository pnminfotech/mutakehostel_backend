// const mongoose = require('mongoose');

// const formSchema = new mongoose.Schema(
//   {
//  srNo: {
//   type: Number,
//   unique: true,
//   required: true
// },

//     name: { type: String, required: true },
//     joiningDate: { type: Date, required: true },
//     roomNo: { type: String },
//     depositAmount: { type: Number, required: true },
//     address: { type: String, required: true },
//     phoneNo : {type: Number, required : true},
//     relativeAddress1: { type: String }, 
//     relativeAddress2: { type: String }, 
//     floorNo: { type: String },
//     bedNo: { type: String },
//     companyAddress: { type: String }, 
//     dateOfJoiningCollege: { type: Date, required: true },
//     dob: { type: Date, required: true },
//       // ✅ Add this line
//   baseRent: { type: Number }, 
//     rents: [
//       {
//         rentAmount: { type: Number},
//         date: { type: Date},
//         month: {type :String},
//       },
//     ],
//     leaveDate: { type: String },
//   });

// module.exports = mongoose.model('Form', formSchema);

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
        date: { type: Date },
        month: { type: String },
        paymentMode: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash"
    }
      },
    ],

    leaveDate: { type: String },

    // ✅ Updated: supports both legacy disk URLs and DB-backed files
    documents: [
      {
        fileName: { type: String },

        // legacy (disk) link — keep for old records
        url: { type: String },

        // NEW: DB-backed fields (DocumentFile model)
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
