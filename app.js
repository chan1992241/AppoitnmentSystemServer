const express = require("express");
const app = express();
const mongoose = require('mongoose');

// use ejs-locals for all ejs templates (refer to ejs-mate doc)
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))

const dbURL = 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //check database connection
db.once('open', function () {
    console.log("database connected");
});

app.get("/", (req, res) => {
    res.send("Hello")
});

app.get("/fakeUser", async (req, res) => {
    // const user = new User({ email: 'colt@gmail.com', username: "colt" })
    // const newUser = await User.register(user, 'password'); //user register method to add new user
    const user = await User.findOne({ username: "chan" })
    res.status(200).send(JSON.stringify(user));
})

app.listen(3000, () => {
    console.log("listening on port 3000")
})