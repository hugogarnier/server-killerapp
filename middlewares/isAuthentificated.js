const jwt = require("jsonwebtoken");

const User = require("../models/User");

const isAuthentificated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne(
      {
        token: req.headers.authorization,
      },
      "account token"
    );
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    } else {
      const payload = jwt.verify(user.token, process.env.SECRET_KEY);
      req.user = user;
      req.payload = payload;
      return next();
    }
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = isAuthentificated;
