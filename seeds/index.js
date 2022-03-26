const mongoose = require("mongoose");
require('dotenv').config();
// connect to mongoose
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/appointmentSystem";
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:")); //check database connection
db.once("open", function () {
  console.log("database connected");
});

const studentUserModel = require("../model/StudentUser");
const studentIDs = ["2004222", "1900762", "1901409", "1801121"];
const LecturerUserModel = require("../model/LecturerUser");
const lecturerUsersIDs = ["2004222", "1900762", "1901409", "1801121"];

const Schedule = require("../model/Schedule");
const scheduleIDsArr = [];
const seedSchedule = async () => {
  await Schedule.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const newSchedule = new Schedule({
      duration: "30",
      dateTime: new Date(2022, 2, Math.floor(Math.random() * 31), Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0),
    })
    scheduleIDsArr.push(newSchedule._id);
    await newSchedule.save();
  }
}

let stuUserID = 0;
let lecturerID = 0;
const seedDB = async () => {
  seedSchedule();
  await studentUserModel.deleteMany({});
  await LecturerUserModel.deleteMany({});
  for (let i = 0; i < studentIDs.length; i++) {
    const user = new studentUserModel({
      studentID: `${studentIDs[i]}`,
      password: "1234",
    })
    const lecturerUser = new LecturerUserModel({
      lecturerID: `${lecturerUsersIDs[i]}`,
      password: "1234",
    })
    await lecturerUser.save();
    await user.save();
    if (i == 2) {
      stuUserID = user._id;
      lecturerID = lecturerUser._id;
    }
  }
  const foundLecturer = await LecturerUserModel.findById(lecturerID);
  console.log(foundLecturer, scheduleIDsArr);
  for (let scheduleID of scheduleIDsArr) {
    foundLecturer.schedules.push(scheduleID);
    await foundLecturer.save();
  }
};

const appointmentModel = require("../model/Appointment");
const seedAppointment = async () => {
  let numberOfAppointment = 30;
  await appointmentModel.deleteMany({});
  for (let i = 0; i < numberOfAppointment; i++) {
    const newAppointment = new appointmentModel({
      title: "Appointment " + i,
      schedule: scheduleIDsArr[0],
      studentID: stuUserID,
      lecturerID: lecturerID,
    })
    await newAppointment.save();
  };
}


seedDB().then(() => {
  seedAppointment().then(() => {
    mongoose.connection.close();
  })
});