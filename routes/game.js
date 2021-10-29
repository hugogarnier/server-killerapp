const router = require("express").Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
const Game = require("../models/Game");
const User = require("../models/User");
const Action = require("../models/Action");

//add
router.post("/newgame", isAuthentificated, async (req, res) => {
  const isGameExist = await Game.findOne({ code: req.body.code });
  if (!isGameExist) {
    const newGame = new Game(req.body);
    const user = await User.findById(req.user.id).populate("games");
    try {
      newGame.admin = req.user.id;
      user.games.push({ code: req.body.code });
      await newGame.save();
      await user.save();
      res.status(200).json(newGame);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "Game already exists with this code" });
  }
});

//add player to a game
router.post("/:code", isAuthentificated, async (req, res) => {
  const game = await Game.findOne({ code: req.params.code });

  if (game) {
    const player = req.user;
    try {
      game.players = player;
      await game.save();
      res.status(200).json(game);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "This game doesn't exist" });
  }
});

module.exports = router;
