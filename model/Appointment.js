const mongoose = require("mongoose");
const LecturerUser = require("./LecturerUser");
const StudentUser = require("./StudentUser");
const Schedule = require("./Schedule");
const Schema = mongoose.Schema

const AppointmentSchema = new Schema({
    title: String(),
    schedule: {
        type: Schema.Types.ObjectId,
        ref: "Schedule"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    studentID: {
        type: Schema.Types.ObjectId,
        ref: StudentUser
    }, lecturerID: {
        type: Schema.Types.ObjectId,
        ref: LecturerUser
    },
});


module.exports = mongoose.model('Appointment', AppointmentSchema)