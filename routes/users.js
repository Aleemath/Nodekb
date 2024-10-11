const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
//bring in user model
const User = require("../model/user");

//register form
router.get("/register", (req, res) => {
  res.render("register");
});

//register process
router.post(
  "/register",

  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("email").isEmail().withMessage("Email is not valid"),
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true; // Indicates the validation passed
    }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register", {
        errors: errors.array(),
      });
    }

    const { name, email, username, password } = req.body;
    let newUser = new User({
      name,
      email,
      username,
      password,
    });
    try {
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);
      await newUser.save();
      req.flash("success", "You are now registered");
      res.redirect("/users/login");
    } catch (err) {
      console.error(err);
      res.render("register", {
        errors: [{ msg: "An error occurred while registering" }],
      });
    }
  }
);
//login form
router.get("/login", (req, res, next) => {
  res.render("login");
});

//login process
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/articles",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

//logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/users/login"); // Redirect to a desired route after logout
  });
});

module.exports = router;
