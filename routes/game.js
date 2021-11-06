const router = require("express").Router();
const isAuthentificated = require("../middlewares/isAuthentificated");
const Game = require("../models/Game");
const User = require("../models/User");
const Action = require("../models/Action");

//add
router.post("/newgame", isAuthentificated, async (req, res) => {
  const isGameExist = await Game.findOne({ code: req.body.code });

  if (!isGameExist) {
    const user = await User.findById(req.user.id).populate("status");
    if (user.status.gameId) {
      res.status(400).json({ message: "You are already in a game" });
    } else {
      const newGame = new Game(req.body);
      // const user = await User.findById(req.user.id).populate("status");

      try {
        newGame.admin = req.user.id;
        // for one game
        user.status.code = newGame.code;
        user.status.gameId = newGame.id;
        user.status.admin = newGame.admin;
        // if several games
        // user.status.push({
        //   admin: newGame.admin,
        //   code: newGame.code,
        //   gameId: newGame.id,
        // });

        newGame.players.push(user);
        await newGame.save();
        await user.save();
        res.status(200).json(newGame);
      } catch (err) {
        res.status(500).json(err);
      }
    }
  } else {
    res.status(400).json({ message: "Game already exists with this code" });
  }
});

//add player to a game
router.post("/entergame", isAuthentificated, async (req, res) => {
  const game = await Game.findOne({ code: req.body.code }).populate("players");
  if (game) {
    const user = await User.findById(req.user.id)
      .populate("status")
      .select("account status");

    // if one game
    const isAlreadyIn = await User.findById(req.user.id).select("status");

    // if several games
    // const isAlreadyIn = await User.findById(req.user.id).select({
    //   status: { $elemMatch: { gameId: game.id } },
    // });

    if (!isAlreadyIn.status.code /*isAlreadyIn.status.length === 0*/) {
      try {
        user.status.code = game.code;
        user.status.gameId = game.id;
        // if more than one game
        // user.status.push({
        //   code: game.code,
        //   gameId: game.id,
        // });
        game.players.push(user);
        await game.save();
        await user.save();

        res.status(200).json(user);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(200).json(isAlreadyIn);
    }
  } else {
    res.status(400).json({ message: "This game doesn't exist" });
  }
});

//add player to a game
router.post("/deletegame", isAuthentificated, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("status")
    .select("account status");
  if (user) {
    try {
      user.status = {
        code: undefined,
        gameId: undefined,
      };
      user.save();
      // await user.save();

      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "This game doesn't exist" });
  }
});

//add player to a game
router.post("/startgame", isAuthentificated, async (req, res) => {
  const game = await Game.findOne({ code: req.body.code });
  if (game) {
    try {
      game.started = true;
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
