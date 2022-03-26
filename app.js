if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require("express");
const app = express();
const studentUserModel = require("./model/StudentUser");
const lecturerUserModel = require("./model/LecturerUser");
const AppointmentModel = require("./model/Appointment");
const mongoose = require("mongoose");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))

const dbURL = process.env.DB_URL || "mongodb://localhost:27017/appointmentSystem";
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //check database connection
db.once('open', function () {
    console.log("database connected");
});

app.get("/", (req, res) => {
    res.send("Hello")
});

app.post("/studentLogin", async (req, res) => {
    const { studentID, password } = req.body;
    const foundStudent = await studentUserModel.findOne({ studentID: studentID });
    if (!foundStudent) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    } if (foundStudent.password !== password) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    }
    return res.status(200).send({ status: "success", message: "Login success", studentID: foundStudent._id });
})

app.post("/lecturerLogin", async (req, res) => {
    const { lecturerID, password } = req.body;
    const foundLecturer = await lecturerUserModel.findOne({ lecturerID: lecturerID });
    if (!foundLecturer) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    } if (foundLecturer.password !== password) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    }
    return res.status(200).send({ status: "success", message: "Login success", lecturerID: foundLecturer._id });
})

// List All appointment by :lecturerDBID
app.get("/listAllBookingLecturer/:lecturerDBID", async (req, res) => {
    const { lecturerDBID } = req.params;
    const foundAppointment = await AppointmentModel.find({ lecturerID: lecturerDBID }).populate("studentID").populate("lecturerID").populate("schedule");
    res.status(200).json(foundAppointment);
})

app.get("/listUpcomingBookingLecturer/:lecturerDBID", async (req, res) => {
    const { lecturerDBID } = req.params;
    // Query Appointment by LecturerDBID and schedule datetime is greater than now
    const foundAppointment = await AppointmentModel.find({ "lecturerID": lecturerDBID, })
        .populate("studentID")
        .populate("lecturerID")
        .populate("schedule");
    const upcomingAppointment = foundAppointment.filter(appointment => {
        return new Date(appointment.schedule.dateTime) > new Date()
    })
    res.status(200).json(upcomingAppointment);
})

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log("listening on port " + port);
})
