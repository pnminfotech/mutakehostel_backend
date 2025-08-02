const mongoose = require('mongoose');

const formSchema = new mongoose.Schema(
  {
 srNo: {
  type: Number,
  unique: true,
  required: true
},

    name: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    roomNo: { type: String, required: true },
    depositAmount: { type: Number, required: true },
    address: { type: String, required: true },
    phoneNo : {type: Number, required : true},
    relativeAddress1: { type: String }, 
    relativeAddress2: { type: String }, 
    floorNo: { type: String, required: true },
    bedNo: { type: String, required: true },
    companyAddress: { type: String }, 
    dateOfJoiningCollege: { type: Date, required: true },
    dob: { type: Date, required: true },
      // ✅ Add this line
  baseRent: { type: Number }, 
    rents: [
      {
        rentAmount: { type: Number},
        date: { type: Date},
        month: {type :String},
      },
    ],
    leaveDate: { type: String },
  });

module.exports = mongoose.model('Form', formSchema);
