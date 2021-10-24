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
});

module.exports = mongoose.model("User", userSchema);
