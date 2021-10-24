const mongoose = require("mongoose");
const { Schema } = mongoose;

const playerSchema = new Schema({
  action: String,
  alive: { type: Boolean, default: true },
  playerToKill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Player", playerSchema);
