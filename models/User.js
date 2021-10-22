const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    unique: true,
    type: String,
  },
  account: {
    firstname: {
      required: true,
      type: String,
    },
    lastname: {
      required: true,
      type: String,
    },
  },
  token: String,
  hash: String,
  salt: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
