const express = require("express");
const app = express();

// use ejs-locals for all ejs templates (refer to ejs-mate doc)
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Hello")
});

app.get("/fakeUser", async (req, res) => {
    // const user = new User({ email: 'colt@gmail.com', username: "colt" })
    // const newUser = await User.register(user, 'password'); //user register method to add new user
    const user = { name: "colt", email: "chan1992241@gmail.com" }
    res.status(200).send(JSON.stringify(user));
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("listening on port " + port);
})