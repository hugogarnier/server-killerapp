require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const Game = require("./models/Game");
const User = require("./models/User");

const app = express();
const httpServer = createServer(app);
app.use(express.json());
app.use(cors());

// mongodb connect
mongoose.connect(process.env.MONGODB_URI);

// import routes
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
const userRoutes = require("./routes/user");
app.use(authRoutes);
app.use(gameRoutes);
app.use(userRoutes);

const io = new Server(httpServer, {
  cors: {
    origin: "http://192.168.1.48:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  //when connect
  console.log("New client connected");
  console.log(socket.id);

  socket.join("game");
  socket.on("some", (data) => {
    //Do socket.to if you want to emit to all clients
    //except sender
    // socket.to("some").emit("some event", data);
    //Do io.to if you want to emit to all clients
    //including sender
    io.to("some room").emit("some", data);
  });

  //send previousCode if one game (to change later)
  socket.on("previousCode", async (senderToken, callback) => {
    try {
      const user = await User.findOne({ token: senderToken });
      const previousCode = user.status.code;
      callback({
        previousCode: previousCode,
      });
    } catch (error) {
      // check error
    }
  });

  //send previousCodes
  socket.on("previousCodes", async (senderToken, callback) => {
    try {
      const user = await User.findOne({ token: senderToken });
      const previousCodes = user.status.map((element) => {
        const rObj = {};
        user.id === element.admin ? (rObj.admin = true) : (rObj.admin = false);
        rObj.code = element.code;
        rObj.alive = element.alive;
        rObj.id = element.id;
        return rObj;
      });
      callback({
        previousCodes: previousCodes,
      });
    } catch (error) {
      // check error
    }
  });

  //send User info
  socket.on("userInfo", async (senderToken, code) => {
    try {
      const user = await User.findOne({ token: senderToken }).populate(
        "status"
      );
      const game = await Game.findOne({ code: code }).populate("players");
      if (user) {
        // if one game
        const player = await User.findOne({ token: senderToken }).select(
          "status"
        );

        // if several games
        // const player = await User.findOne({ token: senderToken }).select({
        //   status: { $elemMatch: { gameId: game.id } },
        // });

        const data = {
          started: game.started,
          close: game.close,
          admin: player.status.admin,
          firstname: user.account.firstname,
          lastname: user.account.lastname,
          alive: player.status.alive,
        };

        socket.emit("userInfo", data);
      }
    } catch (error) {
      // check error
    }
  });

  //send User info
  socket.on("startGame", async (senderToken, code) => {
    try {
      const user = await User.findOne({ token: senderToken }).populate(
        "status"
      );
      const game = await Game.findOne({ code: code }).populate("players");
      if (user) {
        const data = {
          started: game.started,
          playerToKill: user.status.playerToKill,
          action: user.status.action,
        };
        io.to("game").emit("startGame", data);
      }
    } catch (error) {
      // check error
    }
  });

  //send notif kill
  socket.on("sendKill", async ({ senderId, receiverId }) => {
    try {
      const user = getUser(senderId);
      const playerKilled = await Player.findOne({ id: receiverId });
      const newPlayerToKill = playerKilled.playerToKill.account;
      const newAction = playerKilled.action;
      io.to(user.socketId).emit("getKill", {
        newPlayerToKill,
        newAction,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  //send list of players
  socket.on("listOfPlayers", async ({ adminId, code }) => {
    const user = getUser(adminId);
    try {
      const players = await Game.find({ code: code, admin: adminId });
      io.to(user.socketId).emit("getListOfPlayers", {
        players,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(process.env.PORT || 4000, () =>
  console.log(`Server running on port ${process.env.PORT || 4000} `)
);
