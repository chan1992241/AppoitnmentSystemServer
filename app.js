if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require("express");
const app = express();
const studentUserModel = require("./model/StudentUser");
const lecturerUserModel = require("./model/LecturerUser");
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
    console.log(studentID, password);
    const foundStudent = await studentUserModel.findOne({ studentID: studentID });
    console.log(foundStudent)
    if (!foundStudent) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    } if (foundStudent.password !== password) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    }
    return res.status(200).send({ status: "success", message: "Login success", studentID: foundStudent.studentID });
})

app.post("/lecturerLogin", async (req, res) => {
    const { lecturerID, password } = req.body;
    console.log(lecturerID, password);
    const foundLecturer = await lecturerUserModel.findOne({ lecturerID: lecturerID });
    console.log(foundLecturer)
    if (!foundLecturer) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    } if (foundLecturer.password !== password) {
        return res.status(404).send(JSON.stringify({ status: "error", message: "Wrong Username Or Password" }));
    }
    return res.status(200).send({ status: "success", message: "Login success", lecturerID: foundLecturer.lecturerID });
})


const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
    console.log("listening on port " + port);
})
