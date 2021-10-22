const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("email-validator");

const User = require("../models/User");

// register route
router.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (validator.validate(email)) {
      const user = await User.findOne({ email: email });
      if (user) {
        res
          .status(400)
          .json({ message: "An email is already linked to an account" });
      } else {
        const hash = await bcrypt.hash(password, 10);
        const newUser = new User({
          email: email,
          account: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
          },
          hash: hash,
        });

        await newUser.save();
        res.json({ message: "Account created" });
      }
    } else {
      res.status(400).json({ message: "Email not valid" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    // check email and password
    const email = req.body.email;
    const password = req.body.password;

    if (!validator.validate(email) || !password) {
      res.status(401).json({
        message: "Unauthorized",
      });
    } else {
      const user = await User.findOne({ email: email });
      if (!user) {
        res.status(400).json({ message: `User ${email} not found 😰` });
      } else {
        // TODO: JWT for tokens
        const token = "test";

        if (!bcrypt.compare(password, user.hash)) {
          res.status(401).json({
            message: `Wrong password, you are not authorized to login 😡`,
          });
        } else {
          user.token = token;
          await user.save();
          res.json({
            message: "Login successful 👋",
            _id: user._id,
            token: user.token,
            email: user.email,
            account: user.account,
          });
        }
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
