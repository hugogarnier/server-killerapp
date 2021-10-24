const router = require("express").Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
const User = require("../models/User");

//add
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
