const router = require("express").Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
const Game = require("../models/Game");
const Player = require("../models/Player");
const Action = require("../models/Action");

//add
router.post("/newgame", isAuthentificated, async (req, res) => {
  const isGameExist = await Game.findOne({ code: req.body.code });
  if (!isGameExist) {
    const newGame = new Game(req.body);
    try {
      newGame.admin = req.user._id;
      await newGame.save();
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
    const newPlayer = new Player(req.user);
    try {
      newPlayer.action = await Action.findOne({
        /* actions to find*/
      });
      await newPlayer.save();
      res.status(200).json(newPlayer);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "This game doesn't exist" });
  }
});

module.exports = router;
