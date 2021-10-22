const mongoose = require("mongoose");
const { Schema } = mongoose;

const gameSchema = new Schema({
  admin: String,
  close: Boolean,
  started: Boolean,
  code: String,
  title: String,
  description: String,
  players: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
