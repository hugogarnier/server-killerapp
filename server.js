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

io.on("connection", async (socket) => {
  //when connect
  console.log("New client connected");
  console.log(socket.id);

  socket.join("game");

  //send previousCode if one game (to change later)
  socket.on("previousCode", async (senderToken) => {
    try {
      const user = await User.findOne({ token: senderToken });
      const previousCode = user.status.code;

      const data = {
        previousCode: previousCode,
      };
      io.to("game").emit("previousCode", data);
    } catch (error) {
      // check error
      //TODO:
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

  //send is user killed
  socket.on("kill", async (senderToken) => {
    try {
      const user = await User.findOne({ token: senderToken }).populate(
        "status"
      );
      const data = {
        winner: user.status.winner,
        alive: user.status.alive,
      };
      io.to("game").emit("kill", data);
    } catch (error) {
      // check error
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
