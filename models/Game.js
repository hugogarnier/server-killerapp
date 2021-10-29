const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameSchema = new Schema({
  admin: String,
  close: { type: Boolean, default: false },
  started: { type: Boolean, default: false },
  code: String,
});

module.exports = mongoose.model("Game", gameSchema);
