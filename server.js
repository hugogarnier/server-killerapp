require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
app.use(express.json());

// mongodb connect
mongoose.connect(process.env.MONGODB_URI);

// import routes
const userRoutes = require("./routes/auth");
app.use(userRoutes);

const io = new Server(httpServer, {
  /* options */
});

io.on("connection", (socket) => {
  // ...
});

httpServer.listen(process.env.PORT || 4000);
