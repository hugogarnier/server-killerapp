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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (userToken, socketId) => {
  !users.some((user) => user.id === userToken) &&
    users.push({ userToken, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.id === userId);
};

io.on("connection", async (socket) => {
  //when connect
  console.log("New client connected");

  //take userId and socketId from user
  // socket.on("addUser", (userToken) => {
  //   addUser(userToken, socket.id);
  // });

  //send previousCode
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
  socket.on("userInfo", async (senderToken, code, callback) => {
    try {
      const user = await User.findOne({ token: senderToken }).populate(
        "status"
      );
      const game = await Game.findOne({ code: code });
      if (user) {
        const player = await User.findOne({ token: senderToken }).select({
          status: { $elemMatch: { gameId: game.id } },
        });
        callback({
          started: game.started,
          close: game.close,
          firstname: user.account.firstname,
          lastname: user.account.lastname,
          alive: player.status[0].alive,
        });
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
    // removeUser(socket.id);
    // io.emit("getUsers", users);
  });
});

httpServer.listen(process.env.PORT || 4000, () =>
  console.log("Server running")
);
