var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var bodyParser = require("body-parser");
var path = require("path");
var uuid = require("uuid");
var mongoose = require("mongoose");
var User = require("./model.js").User;
var Room = require("./model.js").Room;

mongoose.connect("mongodb://localhost/codeshow");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")));
app.set("views", __dirname + "/public/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.get("/", function(req,res) {
  res.render("index.html");
});

app.post("/login", function(req,res) {
  var pass = true;
  if(!req.body.username) {
    var pass = fail;
    res.status(400).send("Username must be in JSON");
  }
  if(pass) {
    User.find({username: req.body.username}, function(err,data) {
      if(err) {
        res.status(500).send(err);
      }
      if(data.length != 0) {
        res.status(200).send("Username Taken");
      } else {
        var newToken = "Token: " + uuid.v4();
        var userData = {
          "username": req.body.username,
          "token": newToken
        };
        var newUser = new User(userData);
        newUser.save(function(err,data) {
          if(err) {
            res.status(500).send(err);
          }
          res.status(200).send(newToken);
        });
      }
    });
  }
});

app.post("/logout",function(req,res) {
  if(!req.body.usertoken) {
    res.send("usertoken required in JSON");
  }
  User.findOne({token: req.body.usertoken}, function(err, data) {
    if(err) {
      res.status(400).send(err);
    }
    if(data) {
      data.remove();
      data.save();
    }
  });
});

app.post("/newroom", function(req,res) {
  var pass = true;
  if(!req.body.token) {
    var pass = fail;
    res.status(400).send("Token must be in JSON");
  }
  if(pass) {
    User.findOne({token: req.body.token}, function(err,user) {
      if(err) {
        res.status(500).send(err);
      }
      if(user.length) {
        res.status(200).send("Username not found or Expired");
      } else {
        var newtoken = uuid.v4();
        var roomData = {
          owner: user.username,
          token: newtoken
        };
        var newRoom = new Room(roomData);
        newRoom.save(function(err,data) {
          if(err) {
            res.status(500).send(err);
          }
          res.status(200).send(newtoken);
        });
      }
    });
  }
});

app.post("/privilege", function(req,res) {
  var pass = true;
  if(!req.body.token) {
    var pass = false
    res.status(400).send("Token must be in JSON");
  }
  if(!req.body.room) {
    var pass = false;
    res.status(400).send("Room must be in JSON");
  }
  if(pass) {
    User.findOne({token: req.body.token}, function(err,user) {
      if(err) {
        res.status(500).send(err);
      }
      if(user.length) {
        res.status(200).send("Username not found or Expired");
      } else {
        Room.findOne({token: req.body.room}, function(err,room) {
          if(err) {
            res.status(500).send(err);
          }
          if(room) {
            if(room.owner == user.username) {
              res.status(200).send("owner");
            } else{
              res.status(200).send("watcher");
            }
          }
        });
      }
    });
  }
});

io.on("connection", function(socket) {
  socket.on("room", function(data) {
    socket.join(data);
  });
  socket.on("chat message", function(data) {
    if(!data.usertoken) {
      io.sockets.connected[socket.id].emit('chat message', 'Server: Must be logged in');
    } else if(!data.room) {
      io.sockets.connected[socket.id].emit('chat message', 'Server: Error room does not sent');
    } else {
      User.findOne({token: data.usertoken}, function(err,user) {
        if(err) {
          io.sockets.connected[socket.id].emit('chat message', 'Server: Error in user database');
        }
        if(user) {
          Room.findOne({token: data.room},function(err,room) {
            if(err) {
              io.sockets.connected[socket.id].emit('chat message', 'Server: Error ' + err);
            }
            if(room) {
              io.sockets.in(data.room).emit('chat message', user.username + ": " + data.msg);
            }
          });
        } else {
          io.sockets.connected[socket.id].emit('chat message', 'Server: Must be logged in');
        }
      });
    }
  });
  socket.on("code", function(data) {
    if(!data.usertoken) {
      io.sockets.connected[socket.id].emit('code', 'Must be logged in');
    } else if(!data.room) {
      io.sockets.connected[socket.id].emit('code', 'Error room does not exist');
    } else {
      User.findOne({token: data.usertoken}, function(err,user) {
        if(err) {
          io.sockets.connected[socket.id].emit('code', 'Error in user database');
        }
        if(user) {
          Room.findOne({token: data.room},function(err,room) {
            if(err) {
              io.sockets.connected[socket.id].emit('code', 'Error ' + err);
            }
            if(room) {
              if(user.username == room.owner) {
                socket.broadcast.to(data.room).emit('code', data.code);
              }
            } else {
              io.sockets.connected[socket.id].emit('code', 'Error in user database');
            }
          });
        } else {
          io.sockets.connected[socket.id].emit('code', 'Must be logged in');
        }
      });
    }
  });
});

server.listen(8080);
