// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config()
// }
const express = require("express");
const app = express();
const studentUserModel = require("./model/StudentUser");
const lecturerUserModel = require("./model/LecturerUser");
const AppointmentModel = require("./model/Appointment");
const mongoose = require("mongoose");
const Schedule = require('./model/Schedule');
const { populate } = require("./model/StudentUser");
const Appointment = require("./model/Appointment");

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
function changeStatusToEnd(appointmentsArr) {
    appointmentsArr.forEach(appointment => {
        if (new Date(appointment.schedule.dateTime) < new Date()) {
            appointment.status = "end";
        }
    })
    return appointmentsArr
}

app.get("/listAllBookingLecturer/:lecturerDBID", async (req, res) => {
    const { lecturerDBID } = req.params;
    const foundAppointment = await AppointmentModel.find({ lecturerID: lecturerDBID }).populate("studentID").populate("lecturerID").populate("schedule");
    const changedStatusAppointment = changeStatusToEnd(foundAppointment);
    return res.status(200).json(changedStatusAppointment);
})

app.get("/listUpcomingBookingLecturer/:lecturerDBID", async (req, res) => {
    const { lecturerDBID } = req.params;
    // Query Appointment by LecturerDBID and schedule datetime is greater than now
    const foundAppointment = await AppointmentModel.find({ "lecturerID": lecturerDBID, "status": "accepted" })
        .populate("studentID")
        .populate("lecturerID")
        .populate("schedule");
    const upcomingAppointment = foundAppointment.filter(appointment => {
        return new Date(appointment.schedule.dateTime) > new Date()
    })
    return res.status(200).json(upcomingAppointment);
})

/*
 * Request body: date, time, duration
 * date format: yyyy-mm-dd
 * time format: hh:mm
 */
app.post("/uploadSchedule/:lecturerDBID", async (req, res) => {
    const { lecturerDBID } = req.params;
    const { date, time, duration } = req.body;
    const formatDate = new Date(`${date}T${time}:00`);
    const newSchedule = new Schedule({ duration, dateTime: formatDate });  //1995-12-17T03:24:00/
    await newSchedule.save();
    const foundLecturer = await lecturerUserModel.findById(lecturerDBID);
    if (!foundLecturer) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Lecturer not found" }));
    }
    foundLecturer.schedules.push(newSchedule);
    await foundLecturer.save();
    return res.status(200).send({ status: "success", message: "Schedule uploaded" });
})

/*
 * Request status
 * Status only allow ["pending", "accepted", "rejected"]
 */
app.post("/changeAppointmentStatus/:appointmentID", async (req, res) => {
    const { appointmentID } = req.params;
    const { status } = req.body;
    const foundAppointment = await AppointmentModel.findById(appointmentID);
    if (!foundAppointment) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Appointment not found" }));
    }
    foundAppointment.status = status;
    await foundAppointment.save();
    res.status(200).send({ status: "success", message: "Appointment status changed" });
})

app.post("/deleteAppointment/:appointmentID", async (req, res) => {
    const { appointmentID } = req.params;
    const appointment = await AppointmentModel.deleteOne({ _id: appointmentID });
    if (!appointment) {
        res.status(404).send(JSON.stringify({ status: "error", message: "Appointment not found" }));
    }
    res.status(200).send(JSON.stringify({ status: "success", message: "Appointment deleted" }));
})

/*
 * List all lecturer
 */
app.get("/listAllLecturer", async (req, res) => {
    const foundLecturer = await lecturerUserModel.find().populate("schedules");
    if (!foundLecturer) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Lecturer not found" }));
    }
    return res.status(200).json(foundLecturer);
})

/*
 * List all upcoming and all booking of students
 */
app.get("/listAllBookingStudent/:studentDBID", async (req, res) => {
    const { studentDBID } = req.params;
    const foundAppointment = await AppointmentModel.find({ studentID: studentDBID })
        .populate("studentID")
        .populate("lecturerID")
        .populate("schedule");
    const changedStatusAppointment = changeStatusToEnd(foundAppointment);
    return res.status(200).json(changedStatusAppointment);
})

/*
 * List all upcoming and all booking of students
 */
app.get("/listUpcomingBookingStudent/:studentDBID", async (req, res) => {
    const { studentDBID } = req.params;
    const foundAppointment = await AppointmentModel.find({ "studentID": studentDBID, "status": "accepted" })
        .populate("studentID")
        .populate("lecturerID")
        .populate("schedule");
    const upcomingAppointment = foundAppointment.filter(appointment => {
        return new Date(appointment.schedule.dateTime) > new Date()
    })
    return res.status(200).json(upcomingAppointment);
})

/*
 * sent appointment request
 */
app.post("/sentAppointmentRequest", async (req, res) => {
    const { scheduleID, title, description, studentID, lecturerID } = req.body;
    const newAppointmentRequest = new AppointmentModel({
        schedule: scheduleID,
        title,
        description,
        studentID,
        lecturerID
    })
    await newAppointmentRequest.save();
    return res.status(200).send({ status: "success", message: "Appointment request sent" });
})

app.get("/listSpecificLecturerDetail/:lecturerID", async (req, res) => {
    const { lecturerID } = req.params;
    const foundLecturer = await lecturerUserModel.findById(lecturerID).populate("schedules")
    if (!foundLecturer) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Lecturer not found" }));
    }
    return res.status(200).json(foundLecturer);
})

app.delete("/deleteSpecificSchedule/:scheduleID", async (req, res) => {
    const { scheduleID } = req.params;
    const foundSchedule = await Schedule.findById(scheduleID);
    if (!foundSchedule) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Schedule not found" }));
    }
    await foundSchedule.remove();
    return res.status(200).send({ status: "success", message: "Schedule deleted" });
})

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log("listening on port " + port);
})
