const mongoose = require("mongoose")
const Schema = mongoose.Schema

const LecturerUserShema = new Schema({
    lecturerID: {
        type: String,
        required: true,
        unique: true
    }, password: {
        type: String,
        required: true
    }, schedules: [
        {
            type: Schema.Types.ObjectId,
            ref: "Schedule"
        }
    ],
});


module.exports = mongoose.model('LecturerUser', LecturerUserShema);