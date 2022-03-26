const mongoose = require("mongoose");
const LecturerUser = require("./LecturerUser");
const Schema = mongoose.Schema

const ScheduleSchema = new Schema({
    duration: String(),
    dateTime: Date,
});


module.exports = mongoose.model('Schedule', ScheduleSchema);