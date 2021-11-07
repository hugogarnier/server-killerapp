const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  action: String,
  number: Number,
});

module.exports = mongoose.model("Action", actionSchema);
