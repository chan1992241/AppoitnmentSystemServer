require('dotenv').config();
const express = require("express");
const app = express();
const User = require("./model/user");
const mongoose = require("mongoose");
// const socket = require("socket.io");
// use ejs-locals for all ejs templates (refer to ejs-mate doc)
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))

const dbURL = process.env.DB_URL;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //check database connection
db.once('open', function () {
    console.log("database connected");
});

app.get("/", (req, res) => {
    res.send("Hello")
});

app.post("/createUser", async (req, res) => {
    const email = 'chan1992241@gmail.com';
    const user = await User(email);
    res.json(user);
})

app.get("/fakeUser", async (req, res) => {
    // const user = new User({ email: 'colt@gmail.com', username: "colt" })
    // const newUser = await User.register(user, 'password'); //user register method to add new user
    const user = await User.findOne({ username: "chan" })
    res.status(200).send(JSON.stringify(user));
})


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log("listening on port " + port);
})

// const io = socket(server);
// const activeUsers = new Set();
// io.on("connection", function (socket) {
//     socket.on("new user", function (data) {
//         socket.userId = data;
//         activeUsers.add(data);
//         io.emit("new user", [...activeUsers]);
//     });

//     socket.on("disconnect", () => {
//         activeUsers.delete(socket.userId);
//         io.emit("user disconnected", socket.userId);
//     });
//     console.log("Made socket connection");
// });