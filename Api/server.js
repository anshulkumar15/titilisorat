"use strict";
const express = require("express");
const app = require("express")();
const path = require("path");
const dotenv = require('dotenv');
const morgan = require('morgan');

// Load env vars
dotenv.config({ path: './config/config.env' });
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
// Connect to database
connectDB();
const mongoose= require('mongoose').set('debug', true);
mongoose.set('debug', { color: false });
app.use(errorHandler);
app.use(morgan('dev'));
const service = require("./services/TripleChanceService");

const http = require("http").createServer(app);
const io = require("socket.io")(http);
const debug = require("debug")("test");
const events = require("./Constants").events;
const commonVar = require("./Constants").commonVar;
const MatchMaking = require("./utils/MatchMaking").MatchPlayer;
const playerManager = require('./utils/PlayerDataManager');
const makePlayer = require('./utils/connectPlayer');
const PORT =  5001;
const cors = require('cors');


// const corsOptions = {
//   origin:["http://funreep.pro/","http://playreep.pro/","http://playreps.vip/"],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   exposedHeaders: ['custom-header'],
//   optionsSuccessStatus: 200,
// };
//  app.use(
//   cors(corsOptions)
// ); 

app.use(cors({ origin: true, credentials: true, methods: 'POST,GET,PUT,OPTIONS,DELETE' }))
//start socket
require("./gameplay/sendsocket").sendSocket(io.sockets);

const fileUpload = require('express-fileupload');
app.use(fileUpload());


const AuthRoute = require('./routes/AuthRoutes')
const UserRoute = require('./routes/UserRoutes')


var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());


app.use('/api/auth', AuthRoute)
app.use('/api/user', UserRoute)

//app.use(express.urlencoded({extended: false}));
//app.use(express.json())



let onlineUserQ = [];
const maxPlayerInARoom = 7;
console.log("$server started$");

//----------------------
io.on("connection", (socket) => {
  console.log("a user connected " + socket.id);
  OnSendPoints(socket);
  OnNotification(socket);
  OnAcceptPoints(socket);
  OnRejectPoints(socket);
  OnSenderNotification(socket);
  OnUserProfile(socket);
  OnChangePassword(socket);

  onEnterLobby(socket);
  RegisterPlayer(socket);
  DissConnect(socket);
})

function onEnterLobby(socket) {
  socket.on(events.onEnterLobby, (data) => {
    console.log("Player Enter to lobby");
    makePlayer.registeToLobby({
      socketId: socket.id,
      playerId: data[commonVar.playerId]
    });
  })
}

function DissConnect(socket) {
  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");
    makePlayer.exitToLobby(socket.id);
    playerManager.RemovePlayer(socket.id);
  })
}


function RegisterPlayer(socket) {
  socket.on(events.RegisterPlayer, (data) => {
    // console.log("RegisterPlayer", data);
    // console.log(data[commonVar.playerId]);
    let playerObj = {
      socket: socket,
      profilePic: data[commonVar.profilePic],
      playerId: data[commonVar.playerId],
      gameId: data[commonVar.gameId],
      balance: data[commonVar.balance],
    };
    MatchMaking(playerObj)
  })
}

function OnSendPoints(socket) {
  // let socket = data[commonVar.socket];
  socket.on(events.OnSendPoints, async (data) => {
    let result = await service.onSendPointsToPlayer0(data.senderId, data.receiverId, data.points, data.password)
    // await getUserPoint(data);
    if (result == true) {
      socket.emit(events.OnSendPoints, { "status": 200, "message": "PointTransfer Successfully", "data": {} });
    }

    else if (result == 404) {
      socket.emit(events.OnSendPoints, { "status": 404, "message": "Receiver Not Exist", "data": {} });
    }
    else {
      socket.emit(events.OnSendPoints, { "status": 404, "message": "Incorrect Password", "data": {} });

    }
  })
}


function OnUserProfile(socket) {
  // let socket = data[commonVar.socket];
  socket.on(events.OnUserProfile, async (data) => {
    console.log('OnUserProfile', data);
    let result = await service.userByEmail(data.playerId);//authLogin
    if (result.length === 0) {
      return;
    }
    socket.emit(events.OnUserProfile, {
      id: result[0]._id,
      distributor_id: "masterid",
      user_id: result[0].email,

      username: result[0].first_name,
      IMEI_no: "0",
      device: "abcd",
      last_logged_in: result[0].last_login,
      last_logged_out: result[0].last_login,
      IsBlocked: result[0].status,
      password: result[0].password,
      created_at: result[0].created,
      updated_at: result[0].modified,
      active: result[0].status,
      coins: result[0].point

    });
  })
}


function OnNotification(socket) {
  //let socket = data[commonVar.socket];
  socket.on(events.OnNotification, async (data) => {
    console.log('OnNotification')
    let result = await service.onNotification0(data.playerId);//authLogin
    socket.emit(events.OnNotification, {


      "status": 200,
      "message": "User Notification",
      "data": {
        "notification": result,


        "notification_count": result.length

      }

    });
  })
}


function OnAcceptPoints(socket) {
  // let socket = data[commonVar.socket];
  socket.on(events.OnAcceptPoints, async (data) => {
    console.log(data, 'OnAcceptPoints');
    let result = await service.onAcceptPoints0(data.notifyId, data.playerId);//authLogin
    socket.emit(events.OnAcceptPoints, {


      "status": 200,
      "message": "Point Accept Successfully",
      "data": {


      }

    });
  })
}




function OnRejectPoints(socket) {
  // let socket = data[commonVar.socket];
  socket.on(events.OnRejectPoints, async (data) => {
    let result = await service.onRejectPoints0(data.notifyId, data.playerId);//authLogin
    socket.emit(events.OnRejectPoints, {
      "status": 200,
      "message": "Point is not Accept ",
      "data": {
      }

    });
  })
}


function OnSenderNotification(socket) {
  // let socket = data[commonVar.socket];
  socket.on(events.OnSenderNotification, async (data) => {
    let result = await service.onSenderNotification0(data.playerId);//authLogin
    socket.emit(events.OnSenderNotification, {
      "status": 200,
      "message": "User Notification",
      "data": {
        "notification": result,
        "notification_count": result.length
      }
    });
  })
}

function OnChangePassword(socket) {
  // let socket = data[commonVar.socket];
  socket.on(events.OnChangePassword, async (data) => {
    let result = await service.onchangePassword(data.userId, data.old_password, data.new_password);
    console.log("result", result)
    if (result == 404) {
      socket.emit(events.OnChangePassword, {
        "status": 404,
        "message": "Password does not match"
      })
    }
    else {
      socket.emit(events.OnChangePassword, {
        "status": 200,
        "message": "Password Change Successfully",
        "data": {
          id: result[0].userid,

          distributor_id: "masterid",
          user_id: result[0].email,

          username: result[0].first_name,
          IMEI_no: "0",
          device: "abcd",
          last_logged_in: result[0].last_login,
          last_logged_out: result[0].last_login,
          IsBlocked: result[0].status,
          password: result[0].password,
          created_at: result[0].created,
          updated_at: result[0].modified,
          active: result[0].status,
          coins: result[0].point

        }
      });
    }
  })
}


// app.get("/servertesting", (req, res) => {
//   res.sendFile(path.join(__dirname + '/test.html'));
// });
app.get("/servertesting2", (req, res) => {
  res.sendFile(path.join(__dirname + '/test1.html'));
});

app.get("/test", (req, res) => {
  res.send('test')
});

http.listen(PORT, () => {
  console.log("listening on " + PORT);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('unhandeled---->', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});