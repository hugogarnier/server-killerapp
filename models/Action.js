const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  action: String,
});

module.exports = mongoose.model("Action", actionSchema);
