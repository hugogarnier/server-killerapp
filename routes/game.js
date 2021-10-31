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
    const user = await User.findById(req.user.id).populate("status");

    try {
      newGame.admin = req.user.id;
      user.status.push({
        admin: newGame.admin,
        code: newGame.code,
        gameId: newGame.id,
      });
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
  const game = await Game.findOne({ code: req.params.code }).populate(
    "players"
  );

  if (game) {
    const user = await User.findById(req.user.id, "account status").populate(
      "status"
    );
    const isAlreadyIn = await User.findById(req.user.id).select({
      status: { $elemMatch: { gameId: game.id } },
    });

    if (!isAlreadyIn) {
      console.log(isAlreadyIn);
      try {
        game.players.push(user);
        user.status.push({
          code: game.code,
          gameId: game.id,
        });
        await game.save();
        await user.save();
        res.status(200).json(game);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(400).json({ message: "You are already in this game" });
    }
  } else {
    res.status(400).json({ message: "This game doesn't exist" });
  }
});

module.exports = router;
