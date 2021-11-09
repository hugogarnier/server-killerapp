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
        let randomNumber = Math.floor(Math.random() * 100 + 1);
        newGame.admin = req.user.id;
        // for one game
        user.status.code = newGame.code;
        user.status.gameId = newGame.id;
        user.status.admin = newGame.admin;
        user.status.randomNumber = randomNumber;
        user.status.winner = false;
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
        let randomNumber = Math.floor(Math.random() * 100 + 1);
        user.status.randomNumber = randomNumber;
        user.status.code = game.code;
        user.status.gameId = game.id;
        user.status.winner = false;
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

//delete a game
router.post("/deletegame", isAuthentificated, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("status")
    .select("account status");

  if (user) {
    if (user.status.admin) {
      try {
        await User.updateMany(
          { "status.code": req.body.code },
          {
            "status.code": "",
            "status.gameId": "",
            "status.admin": "",
          }
        ).populate("status");

        await Game.findOneAndDelete({ code: req.body.code });
        await user.save();
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      try {
        user.status = {
          code: undefined,
          gameId: undefined,
        };
        await user.save();
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json(err);
      }
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
      const users = await User.find({ code: req.body.code }).populate("status");
      users.sort((a, b) => {
        if (a.status.randomNumber < b.status.randomNumber) return -1;
        if (a.status.randomNumber > b.status.randomNumber) return 1;
        return 0;
      });

      const actions = await Action.find();

      let userIndex = 0;
      const stockageRandomActionNumber = [];
      users.map((user) => {
        const randomActionNumber = Math.floor(Math.random() * 4 + 1);
        if (stockageRandomActionNumber.includes(randomActionNumber)) {
          randomActionNumber = Math.floor(Math.random() * 4 + 1);
        }
        stockageRandomActionNumber.push(randomActionNumber);
        const action = actions.filter(
          (action) => action.number === randomActionNumber
        );

        if (users.length - 1 === userIndex) {
          user.status.playerToKill = users[0].account.firstname;
          user.status.playerToKillId = users[0].id;
          user.status.action = action[0].action;
        } else {
          user.status.playerToKill = users[userIndex + 1].account.firstname;
          user.status.playerToKillId = users[userIndex + 1].id;
          user.status.action = action[0].action;
          userIndex++;
        }
      });

      game.started = true;

      await game.save();
      for (let user of users) {
        await user.save();
      }

      res.status(200).json(game);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "This game doesn't exist" });
  }
});

//kill a player
router.post("/kill", isAuthentificated, async (req, res) => {
  const game = await Game.findOne({ code: req.body.code }).populate({
    path: "players",
    populate: { path: "status" },
  });
  if (game) {
    try {
      const user = await User.findOne({ code: req.body.code }).populate(
        "status"
      );
      const userKilled = await User.findById(
        user.status.playerToKillId
      ).populate("status");
      user.status.playerToKill = userKilled.status.playerToKill;
      user.status.playerToKillId = userKilled.status.playerToKillId;
      user.status.action = userKilled.status.action;
      userKilled.status.alive = false;

      // const lastPlayer = game.players.filter(
      //   (player) => player.status.alive === true
      // );
      if (user.id === user.status.playerToKillId) {
        user.status.winner = true;
      }

      await user.save();
      await userKilled.save();

      res.status(200).json(user.status);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "Error one the kill" });
  }
});

module.exports = router;
