// models/Room.js
const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNo: String,
  price: { type: Number, default: null }
});


const roomSchema = new mongoose.Schema({
  roomNo: String,
  floorNo: String,
  category: { type: String, default: "" },
  beds: [bedSchema]
});

module.exports = mongoose.model('Room', roomSchema);
