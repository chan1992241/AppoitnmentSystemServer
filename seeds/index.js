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
const seedDB = async () => {
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
  }
};



seedDB().then(() => {
  mongoose.connection.close();
});
