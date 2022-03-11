const mongoose = require("mongoose")
const Schema = mongoose.Schema

const StudentUserSchema = new Schema({
  studentID: {
    type: String,
    required: true,
    unique: true
  }, password: {
    type: String,
    required: true
  },
});


module.exports = mongoose.model('StudentUser', StudentUserSchema)