const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const flash = require("connect-flash");
const config = require("./config/database");
const passport = require("passport");
let articles = require("./routes/articles");
let users = require("./routes/users");

mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once("open", () => {
  console.log("Connected to MongoDB");
});

//check for db error
db.on("error", (err) => {
  console.log(err);
});

// init app
const app = express();
app.use(express.json());
app.use(flash());

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
//load view engin
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bodyParser.json());

//set public  folder
// app.use("/articles", articles);
app.use(express.static(path.join(__dirname, "public")));

//express session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);

//express messages middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//express validator middleware
const errorFormatter = (param, msg, value) => {
  return {
    param: param,
    msg: msg,
    value: value,
  };
};

//passport config
require("./config/passport")(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.post("/sign-up", async (req, res) => {
  const errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    console.log("Sign-up validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  console.log("Sign-up successful");

  // Proceed with your signup logic here
  res.send("Success!");
});

app.use("/articles", articles);
app.use("/users", users);

// start server
app.listen(3000, () => {
  console.log("Server  started on port 3000...");
});
