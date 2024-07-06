const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

// creating a express server
const app = express();

// creating a http server
const server = http.createServer(app);

// creating a socket.io server and attaching it to the http server
const io = socketio(server);

// ejs setup
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const connectedUsers = {};

io.on("connection", function (socket) {
  connectedUsers[socket.id] = {
    socket,
  };
  socket.on("send-location", (data) => {
    console.log(data);
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", function () {
    io.emit("user-disconnected", socket.id);
  });
});
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/connected-users", (req, res) => {
  res.json(Object.keys(connectedUsers));
});

const port = process.env.PORT || 3500;
server.listen(port, "0.0.0.0", () => {
  console.log("Server is listening at Port 3500");
});
