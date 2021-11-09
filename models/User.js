const mongoose = require("mongoose");
const { Schema } = mongoose;

// user to use signel game per user
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
  status: {
    playerToKill: String,
    playerToKillId: String,
    winner: { type: Boolean, default: false },
    action: String,
    randomNumber: Number,
    alive: { type: Boolean, default: true },
    gameId: String,
    code: String,
    admin: String,
  },
  token: String,
  hash: String,
});

// User to use if several games

// const userSchema = new Schema({
//   email: {
//     unique: true,
//     type: String,
//   },
//   account: {
//     firstname: {
//       required: true,
//       type: String,
//     },
//     lastname: {
//       required: true,
//       type: String,
//     },
//   },
//   status: [
//     {
//       playerToKill: String,
//       action: String,
//       alive: { type: Boolean, default: true },
//       gameId: String,
//       code: String,
//       admin: String,
//     },
//   ],
//   token: String,
//   hash: String,
// });

module.exports = mongoose.model("User", userSchema);
