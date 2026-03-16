"use strict";
const debug = require("debug")("test");
const DB_debug = require("debug")("db");
const service = require("../services/TripleChanceService");
const events = require("../Constants").events;
const commonVar = require("../Constants").commonVar;
const state = require("../Constants").state;
const spot = require("../Constants").spot;
const timerVar = require("../Constants").timerVar;
const gameId = 6;
const gameRoom = require("../Constants").selectGame[gameId];
const CardsSet = require("../Constants").setOfCards;

let timer1 = timerVar.bettingTripleChance;

const botManager = require("../utils/BotManager");
const playerManager = require("../utils/PlayerDataManager");

//json
const chipDataJson = require("../jsonfiles/ChipsData.json");
const RandomWinAmounts = require("../jsonfiles/wins.json");
const { PointTransfer } = require("../controllers/UserController");
const { json } = require("body-parser");

const LEFT_RIGHT_WIN_RATE = 2;
const MIDDLE_WIN_RATE = 8;

let Sockets;
let gameState;

let currentRoundData = {}; //this will users bets, playerId and spot
let BetHolder = new Object(); //user bet on each spot sum
let LeftBets = [];
let MiddleBets = [];
let RightBets = [];
let fakeLeftBets; //bot fake bet
let fakeMiddleBets;
let fakeRightBets;

let timeStamp; //as room id(change after 30 sec)
let ROUND_COUNT = 0; //reset to 0 after 5 round
let previousWin_single = [1, 2, 3, 4, 5];

let winPoint = 0;

let previousWin_double = [25, 11, 15, 33, 77];
let playerName = "";
let previousWin_triple = [125, 211, 715, 133, 277];
let singleNoBet = [];
let doubleNoBet = [];
let tripleNoBet = [];
let isbetPlaced = false;

let Win_singleNo = 0;
let Win_doubleNo = 0;
let Win_tripleNo = 0;

let usersingleNoChoice = [];
let userdoubleNoChoice = [];
let usertripleNoChoice = [];
var NewpreviousWin_single = [1, 8, 4, 9, 7, 2, 6];
var NewpreviousWin_double = [12, 58, 64, 29, 17, 52, 61];
var NewpreviousWin_triple = [211, 118, 234, 229, 127, 342, 612];

let win_globalSingle = -1;
let win_globalifnoBetSingle = -1;
let win_globalDouble = -1;
let win_globalifnoBetDouble = -1;
let win_globalTriple = -1;
let win_globalifnoBetTriple = -1;
var flags1 = 0;
let previousWins = new Array(20);
let BotsBetsDetails = []; //Array of 6 bots with amount of bet on each spot (array filled by RegisterBots ↓)
RegisterBots();
SetInitialData();

function GetSocket(SOCKET) {
  Sockets = SOCKET;
  ResetTimers();
}

async function SetInitialData() {
  //THIS WILL RUN ONLY ONCE
  previousWins = await service.lastWinningNo(); //db
  let D = new Date();
  timeStamp = D.getTime();
}

function StartTripleChance(data) {
  // console.log('StartTripleChance');
  SendCurrentRoundInfo(data);

  OnChipMove(data);
  OnBetsPlaced(data);
  OnWinAmount(data);
  //OnWinNo(data);

  OnNotification(data);
  OnChangePassword(data);

  OnSenderNotification(data);
  OnSendPoints(data);
  OnRejectPoints(data);
  OnAcceptPoints(data);
  OnUserProfile(data);
  //start----------
  //OnWinNo(data);
  // OnPlayerWin();
  //OnPlaceBet(data);

  //OnDissConnected(data);
  gameHistoryRecord(data);
  OnleaveRoom(data);
  OnTest(data);
}

function OnleaveRoom(data) {
  let socket = data[commonVar.socket];
  socket.on(events.onleaveRoom, function (data) {
    try {
      // console.log('OnleaveRoom--triplec')
      socket.leave(gameRoom);
      socket.removeAllListeners(events.OnChipMove);
      socket.removeAllListeners(commonVar.test);
      socket.removeAllListeners(events.OnBetsPlaced);
      socket.removeAllListeners(events.OnWinNo);
      socket.removeAllListeners(events.OnTimeUp);
      socket.removeAllListeners(events.OnTimerStart);
      socket.removeAllListeners(events.OnCurrentTimer);

      socket.removeAllListeners(events.onleaveRoom);
      socket.removeAllListeners(events.OnHistoryRecord);
      playerManager.RemovePlayer(socket.id);
      socket.emit(events.onleaveRoom, {
        success: `successfully leave ${gameRoom} game.`,
      });
    } catch (err) {
      // console.log(err);
    }
  });
}

//Game events

function OnBetsPlaced(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnBetsPlaced, async (data) => {
    // socket.to(gameRoom).emit(events.OnChipMove, data);
    // console.log("triple-chace OnBetsPlaced", data);
    var userBalance = await service.onbalance(data.playerId);
    // console.log("user-debt");
    if (
      userBalance[0].point >=
      //data.singleVal + data.doubleVal + data.tripleVal

      data.totalsingleVal + data.totaldoubleVal + data.totaltripleVal

    ) {
      playerName = data.playerId;

      //  // console.log("bet request", data);
      await service.AddPlayerIdInBetplaced(data.playerId);

      singleNoBet = data.singleVal;
      doubleNoBet = data.doubleVal;
      tripleNoBet = data.tripleVal;
      playerName = data.playerId;
      userdoubleNoChoice = data.doubleNo;
      usersingleNoChoice = data.single;

      usertripleNoChoice = data.triple;

      /* isbetPlaced=true
    var array=[]
    array=data.BetsAmount
   if(array.length>0){
    Win_singleNo =data.BetsValue[(array.indexOf(Math.min(...array)))]
   }
   else{
    Win_singleNo=Math.floor(Math.random() * 10);

   }
   */ playerName = data.playerId;

      let point = await service.getUserPoint(data.playerId, data.points);

      // console.log("Point", point);

      await service.TripleChanceBets(
        data.totalsingleVal,
        data.totaldoubleVal,
        data.totaltripleVal
      );

      var TripleChancebetsResult = await service.Detailtriplechance();
      // console.log("Detailtriplechance", TripleChancebetsResult);
      if (
        TripleChancebetsResult.singleNo < TripleChancebetsResult.doubleNo &&
        TripleChancebetsResult.singleNo < TripleChancebetsResult.tripleNo
      ) {
        Win_singleNo = 1;
      }
      if (
        TripleChancebetsResult.doubleNo < TripleChancebetsResult.tripleNo &&
        TripleChancebetsResult.doubleNo < TripleChancebetsResult.singleNo
      ) {
        Win_singleNo = 2;
      }

      if (
        TripleChancebetsResult.tripleNo < TripleChancebetsResult.doubleNo &&
        TripleChancebetsResult.tripleNo < TripleChancebetsResult.singleNo
      ) {
        Win_singleNo = 3;
      }
      let Game = await service.GameRunning(
        data.playerId,
        ROUND_COUNT,
        JSON.stringify(usersingleNoChoice),
        JSON.stringify(userdoubleNoChoice),
        JSON.stringify(usertripleNoChoice),
        JSON.stringify(singleNoBet),
        JSON.stringify(doubleNoBet),
        JSON.stringify(tripleNoBet),

        Win_singleNo
      );
      // console.log("Game", Game);
      if (
        data.totalsingleNoVal == 0 &&
        data.totaldoubleNoVal == 0 &&
        data.totaltripleNoVal == 0
      ) {
        socket.emit(events.OnBetsPlaced, {
          status: 400,
          message: "Bet not Confirmed",
          data: {
            playerId: data.playerId,
            balance:
              userBalance[0].point -
              (data.totalsingleVal + data.totaldoubleVal + data.totaltripleVal),
          },
        });
      } else {
        socket.emit(events.OnBetsPlaced, {
          status: 200,
          message: "Bet Confirmed",
          data: {
            playerId: data.playerId,
            balance:
              userBalance[0].point -
              (data.totalsingleVal + data.totaldoubleVal + data.totaltripleVal),
          },
        });
      }
    } else {
      socket.emit(events.OnBetsPlaced, {
        status: 400,
        message: "insufficient balance ,Please add balance to your account",
        data: {
          playerId: data.playerId,
        },
      });
    }
  });
}

async function OnWinNo(data, S, D, T) {
  // let socket = data[commonVar.socket];
  // socket.on("OnWinNo", async (data) => {
  Win_singleNo = 0;
  var playerId = data.playerId;
  var adminWin = await service.getAdmintriplechance();
  var RoundCount = ROUND_COUNT;
  var previousWin_single = previousWin_single;
  var game_id = 6;
  //var Balance= result2[0].point;
  var isplayerexist = await service.GetPlayerIdInBetplaced(data.playerId);
  if (isplayerexist == true) {
    let Game = await service.GetGameRunningData(data.playerId);
    if (Game == "no user data exits") {
      // socket.emit("OnWinNo", { message: "no user data exits" });
    } else {

      if (
        adminWin.value1 == -1 &&
        adminWin.value2 == -1 &&
        adminWin.value3 == -1
      ) {

        winPoint = 0;
        // console.log(Game.singleNo)
        if ((Game.singleNo).indexOf(S) != -1) {
          winPoint =
            winPoint +
            (Game.singleVal)[
            (Game.singleNo).indexOf(S)
            ] *
            9;
        }
        // console.log(winPoint)

        if ((Game.doubleNo).indexOf(D) != -1) {
          winPoint =
            winPoint +
            (Game.doubleVal)[
            (Game.doubleNo).indexOf(D)
            ] *
            90;
        }
        if ((Game.tripleNo).indexOf(T) != -1) {
          winPoint =
            winPoint +
            (Game.tripleVal)[
            (Game.tripleNo).indexOf(T)
            ] *
            750;
        }

        // NewpreviousWin_single.push(Win_singleNo);

        await service.UpdateGameRunningDataWinSingleNumber(
          data.playerId,
          Game.playedTime,
          T
        );

        /* await service.RemoveDragonVsTigerBetOfUser(
           Game.singleNo,
           Game.tripleNo
         );
          */
        let Game1 = await service.UpdateGameRunningDataWinpoint(
          data.playerId,
          Game.playedTime,
          winPoint
        );
        /*  let point = await service.updateUserPoint(
             data.playerId,
             winPoint
           );
            // console.log("Points", point);
           */ /* await service.RemovePlayerIdInBetplaced(data.playerId); */
    //    await service.PlayerDetails( data.playerId,ROUND_COUNT,S, D, T,  T);
        await service.WinamountDetails(data.playerId, game_id, winPoint)



         /*  socket.emit("OnWinNo", {
            message: "wins",
            winPoint: winPoint,
            winSingleNo: win_globalSingle,
            winDoubleNo: con_doubleNo,
            winTripleNo: con_tripleNo,

            playerId: data.playerId,
            RoundCount: ROUND_COUNT,
            previousWins: NewpreviousWin_single,
            previousWinsDouble: NewpreviousWin_double,
            previousWinsTriple: NewpreviousWin_triple,

            //previousWin_single: previousWin_single,
            // Balance: point,
          });
          */ SuffleBots();
      }
      else {
        //Win_singleNo =  adminWin.value1+ adminWin.value2 + adminWin.value3;

        //NewpreviousWin_single.pop;

        var Win_singleNorandom = adminWin.value1;
        var Win_doubleNorandom = adminWin.value2;
        var Win_tripleNorandom = adminWin.value3;
        let con_doubleNo = parseInt(
          Win_doubleNorandom.toString() + Win_singleNorandom.toString()
        );
        let con_tripleNo = parseInt(
          Win_tripleNorandom.toString() +
          Win_doubleNorandom.toString() +
          Win_singleNorandom.toString()
        );
        if ((Game.singleNo).indexOf(Win_singleNorandom) != -1) {
          winPoint =
            winPoint +
            (Game.singleVal)[
            (Game.singleNo).indexOf(Win_singleNorandom)
            ] *
            9;
        }
        if ((Game.doubleNo).indexOf(con_doubleNo) != -1) {
          winPoint =
            winPoint +
            (Game.doubleVal)[
            (Game.doubleNo).indexOf(con_doubleNo)
            ] *
            90;
        }
        if ((Game.tripleNo).indexOf(con_tripleNo) != -1) {
          winPoint =
            winPoint +
            (Game.tripleVal)[
            (Game.tripleNo).indexOf(con_tripleNo)
            ] *
            750;
        }

        // NewpreviousWin_single.push(Win_singleNo);

        // console.log("Win_singleNo", Win_singleNo);
        await service.UpdateGameRunningDataWinSingleNumber(
          data.playerId,
          Game.playedTime,
          Win_singleNo
        );

        /* await service.RemoveDragonVsTigerBetOfUser(
         Game.singleNo,
         Game.tripleNo
       );
        */
        let Game1 = await service.UpdateGameRunningDataWinpoint(
          data.playerId,
          Game.playedTime,
          winPoint
        );
        /*  let point = await service.updateUserPoint(
           data.playerId,
           winPoint
         );
          // console.log("Points", point);
         */
        /* await service.RemovePlayerIdInBetplaced(data.playerId); */
      //  await service.PlayerDetails(data.playerId, ROUND_COUNT, win_globalSingle, con_doubleNo, con_tripleNo, con_tripleNo)
        await service.WinamountDetails(data.playerId, game_id, winPoint)



         /*  socket.emit("OnWinNo", {
            message: "wins",
            winPoint: winPoint,
            winSingleNo: win_globalSingle,
            winDoubleNo:con_doubleNo,
            winTripleNo:con_tripleNo,
            
            playerId: data.playerId,
            RoundCount: ROUND_COUNT,
            previousWins: NewpreviousWin_single,
            previousWinsDouble: NewpreviousWin_double,
            previousWinsTriple: NewpreviousWin_triple,

            //previousWin_single: previousWin_single,
            // Balance: point,
          */ SuffleBots();
      }

      //    socket.emit("OnWinNoResult",{message:Game})
    }
  }




  //   // console.log("Game", Game);
  //});
}





/* function OnWinAmount(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnWinAmount, async (data) => {
     // console.log("winAmount hit", data);
    await service.updateUserPoint(data.playerId, data.win_points);
    socket.emit(events.OnWinAmount, { status: 200, message: "added amount" });
  });
}
 */

function OnWinAmount(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnWinAmount, async (data) => {
    // console.log("winAmount hit", data);
    //  await service.updateUserPoint(data.playerId, data.win_points);
    let point = await service.updateUserPoint(
      data.playerId,
      // Game.singleNo * 2.2
      //data.point
      data.winpoint
    );
    // console.log("Points", point);
    socket.emit(events.OnWinAmount, {
      /* win_no: Win_singleNo,
      RoundCount: ROUND_COUNT,
  */ // win_point: data.winpoint,
      playerId: data.playerId,
      Balance: point,
      message: "point added in user account",
    });
  });
}

//-------------------------------------------------------------------------------------------------
function OnSendPoints(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnSendPoints, async (data) => {
    let result = await service.onSendPointsToPlayer(
      data.senderId,
      data.receiverId,
      data.points,
      data.password
    );
    // await getUserPoint(data);
    if (result == true) {
      socket.emit(events.OnSendPoints, {
        status: 200,
        message: "PointTransfer Successfully",
        data: {},
      });
    } else if (result == 404) {
      socket.emit(events.OnSendPoints, {
        status: 404,
        message: "Receiver Not Exist",
        data: {},
      });
    } else {
      socket.emit(events.OnSendPoints, {
        status: 404,
        message: "Incorrect Password",
        data: {},
      });
    }
  });
}

function OnUserProfile(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnUserProfile, async (data) => {
    let result = await service.userByEmail(data.playerId); //authLogin
    socket.emit(events.OnUserProfile, {
      id: result[0].id,
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
      coins: result[0].point,
    });
  });
}

function OnNotification(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnNotification, async (data) => {
    let result = await service.onNotification(data.playerId); //authLogin
    socket.emit(events.OnNotification, {
      status: 200,
      message: "User Notification",
      data: {
        notification: result,

        notification_count: result.length,
      },
    });
  });
}

function OnAcceptPoints(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnAcceptPoints, async (data) => {
    let result = await service.onAcceptPoints(data.notifyId, data.playerId); //authLogin
    socket.emit(events.OnAcceptPoints, {
      status: 200,
      message: "Point Accept Successfully",
      data: {},
    });
  });
}

function OnRejectPoints(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnRejectPoints, async (data) => {
    let result = await service.onRejectPoints(data.notifyId, data.playerId); //authLogin
    socket.emit(events.OnRejectPoints, {
      status: 200,
      message: "Point is not Accept ",
      data: {},
    });
  });
}

function OnSenderNotification(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnSenderNotification, async (data) => {
    let result = await service.onSenderNotification(data.playerId); //authLogin
    socket.emit(events.OnSenderNotification, {
      status: 200,
      message: "User Notification",
      data: {
        notification: result,

        notification_count: result.length,
      },
    });
  });
}

function OnChangePassword(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnChangePassword, async (data) => {
    let result = await service.onchangePassword(
      data.userId,
      data.old_password,
      data.new_password
    );
    // console.log("result", result);
    if (result == 404) {
      socket.emit(events.OnChangePassword, {
        status: 404,
        message: "Password does not match",
      });
    } else {
      socket.emit(events.OnChangePassword, {
        status: 200,
        message: "Password Change Successfully",
        data: {
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
          coins: result[0].point,
        },
      });
    }
  });
}

//On OnPlayerWin--------------------------------------------------------------------------------------

async function OnPlayerWin() {
  let result = WinNosCalculator();
  let winningSpot = result.spot;
  for (let socketId in BetHolder) {
    let betData = BetHolder[socketId];

    if (winningSpot === 0) {
      betData[commonVar.win] = betData[0] * LEFT_RIGHT_WIN_RATE;
    } else if (winningSpot === 1) {
      betData[commonVar.win] = betData[1] * MIDDLE_WIN_RATE;
    } else {
      betData[commonVar.win] = betData[2] * LEFT_RIGHT_WIN_RATE;
    }

    BetHolder[socketId] = betData;

    // let winAmount = betData[commonVar.win] - (betData[0]+betData[1]+betData[2])
    // betData[commonVar.socket].emit(events.OnPlayerWin,{winAmount});

    if (betData[commonVar.win] > 0) {
      let winAmount =
        betData[commonVar.win] -
        betData[commonVar.win] * commonVar.adminCommisionRate;
      // console.log(
      //   "player " + betData[commonVar.playerId] + ` wins amount ${winAmount}`
      // );
      betData[commonVar.socket].emit(events.OnPlayerWin, { winAmount });
    } else {
      // console.log(
      //   `player ${betData[commonVar.playerId]} lost ${betData[0] + betData[1] + betData[2]
      //   } `
      // );
    }
  }

  //$- Add bet info to Database
  const playerWiningBalance = await service.updateWinningAmount({
    spot: winningSpot,
    room_id: timeStamp,
  });
  // console.log("Player bet info:");
  BetHolder = new Object();
}
//On OnWinNo------------------------------------------------------------------------------------------
/* async function OnWinNo() {
  let result = WinNosCalculator();
  let winNo = result.winNo;
  let winningSpot = result.spot;
  let data = {
    room_id: timeStamp,
    game_id: 6,
    winNo1: winNo[0],
    winNo2: winNo[1],
    spot: winningSpot,
  };
  let WinningCards = createWinningCards(winNo);

  const saveWinningNo = await service.updateWinningNo(data); //db

  // //ADD WIN NO TO ARRAY
  previousWins = PushWinNo(winningSpot);
  //  // console.log(`L :${fakeLeftBets}, M : ${fakeMiddleBets}, R :${fakeRightBets}`);

  CalculateBotsWinAmount(winningSpot);
  await PlayersWinAmountCalculator(winningSpot);
  let RandomWinAmount =
    RandomWinAmounts[Math.floor(GetRandomNo(0, RandomWinAmounts.length))];
  //  // console.log("random win no:" + RandomWinAmount);
 
  Sockets.to(gameRoom).emit(events.OnWinNo, {
    winningSpot,
    previousWins,
    RandomWinAmount,
  });
  SuffleBots();
}
 */
//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

async function addPlayerToRoom(data) {
  let socket = data[commonVar.socket];
  let balance = await service.getUserBalance(data.playerId); //db
  let obj = {
    socketId: socket.id,
    balance, //this value will come from database
    avatarNumber: 0, //this value wil come from frontend
    playerId: data.playerId, //this value will come from database
  };
  playerManager.AddPlayer(obj);
  return obj;
}

function OnDissConnected(data) {
  let socket = data[commonVar.socket];
  socket.on("disconnect", (data) => {
    // console.log("player got dissconnected " + socket.id);
    playerManager.RemovePlayer(socket.id);
  });
}

async function SendCurrentRoundInfo(data) {
  let socket = data[commonVar.socket];
  let timer = 0;

  switch (gameState) {
    case state.canBet:
      timer = i;
      break;
    case state.cannotBet:
      timer = j;
      break;
    case state.wait:
      timer = k;
      break;
  }

  // let player = await addPlayerToRoom(data);

  let obj = {
    gametimer: i,
    RoundCount: ROUND_COUNT,

    // gameState,
    // socketId : player.socketId,
    previousWins: NewpreviousWin_single,
    previousWinsDouble: NewpreviousWin_double,
    previousWinsTriple: NewpreviousWin_triple,

    botsBetsDetails: BotsBetsDetails,
    //balance: player.balance,
  };

  socket.emit(events.OnCurrentTimer, obj);
}

//Game History Record=====================================================================
function gameHistoryRecord(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnHistoryRecord, async function (data) {
    let matrixRecord = await service.gameMartixRecords();
    let slotRecord = await service.gameSlotRecords();
    socket.emit(events.OnHistoryRecord, { matrixRecord, slotRecord });
  });
}
//====================================END=================================================

//On Chip Move =>Save all user Bet==================================================

function OnChipMove(D) {
  let socket = D[commonVar.socket];
  socket.on(events.OnChipMove, (data) => {
    AddBalanceToDatabase(data);
    switch (data[commonVar.spot]) {
      case spot.left:
        LeftBets.push(data[commonVar.chip]);
        break;
      case spot.middle:
        MiddleBets.push(data[commonVar.chip]);
        break;
      case spot.right:
        RightBets.push(data[commonVar.chip]);
        break;
      default:
        break;
    }

    let obj = {
      chip: data[commonVar.chip],
      position: data[commonVar.position],
    };
    if (currentRoundData[data[socket.id]] === undefined) {
      currentRoundData[data[socket.id]] = {
        //following are the spots
        0: [], //left bets
        1: [], //middle bets
        2: [], //right bets
        playerId: data[commonVar.playerId],
      };
      currentRoundData[data[socket.id]][data[commonVar.spot]].push(obj);
    } else {
      currentRoundData[data[socket.id]][data[commonVar.spot]].push(obj);
    }

    //this will help add bets
    if (BetHolder[socket.id] === undefined) {
      let Obj = {
        0: 0, //left bet
        1: 0, //middle bet
        2: 0, //right bet
        win: 0,
        playerId: data[commonVar.playerId],
        socket,
      };

      BetHolder[socket.id] = Obj;
      BetHolder[socket.id][data[commonVar.spot]] = data[commonVar.chip];
    } else {
      BetHolder[socket.id][data[commonVar.spot]] += data[commonVar.chip];
    }

    socket.to(gameRoom).emit(events.OnChipMove, data);
  });
}

async function AddBalanceToDatabase(data) {
  data[commonVar.gameId] = gameId;
  const saveBet = await service.JoinGame(data, timeStamp); //db
}

//End On Chip Move =>Save all user Bet ==============================================

/* function OnPlaceBet(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnPlaceBet, async (data) => {
    let result = await JoinGame(data, RoundCount, gameState);  //db 
    Sockets.to(gameRoom).emit(events.OnPlaceBet, result);
  });
}
 */
//On OnSendWinNo =>Calcuate game Winning No when j==8 ======================================

async function OnSendWinNo() {
  let result = await WinNosCalculator();
  // console.log("result", result);
  let winNo = result.winNo;
  let winningSpot = result.spot;
  let singleNo = result.singleNo;
  let doubleNo = result.doubleNo;
  let tripleNo = result.tripleNo;
  let winPoint = result.win_point;
  let data = {
    room_id: timeStamp,
    game_id: 6,
    winNo1: winNo[0],
    winNo2: winNo[1],
    spot: winningSpot,
  };
  let WinningCards = createWinningCards(winNo);

  const saveWinningNo = await service.updateWinningNo(data); //db

  // //ADD WIN NO TO ARRAY
  previousWins = PushWinNo(winningSpot);
  //  // console.log(`L :${fakeLeftBets}, M : ${fakeMiddleBets}, R :${fakeRightBets}`);

  CalculateBotsWinAmount(winningSpot);
  await PlayersWinAmountCalculator(winningSpot);
  let RandomWinAmount =
    RandomWinAmounts[Math.floor(GetRandomNo(0, RandomWinAmounts.length))];
  //  // console.log("random win no:" + RandomWinAmount);

  /* Sockets.to(gameRoom).emit(events.OnWinNo, {
  	
    WinningCards,singleNo,doubleNo,tripleNo,RoundCount:ROUND_COUNT,playerId:"RL00001",winNo,winningSpot,previousWin_single:previousWins,previousWin_double:previousWins,previousWin_triple:previousWins, botsBetsDetails: BotsBetsDetails,RandomWinAmount ,win_points:9});
       */
  usersingleNoChoice = [];
  userdoubleNoChoice = [];
  usertripleNoChoice = [];
  if (playerName != "") {
    var result2 = await service.onbalance(playerName);
  } else {
    var result2 = [{ point: 0 }];
  }

  Sockets.to(gameRoom).emit(events.OnWinNo, {
    singleNo,
    doubleNo,
    tripleNo,
    RoundCount: ROUND_COUNT,
    playerId: playerName,
    previousWin_single: previousWin_single,
    previousWin_double: previousWin_double,
    previousWin_triple: previousWin_triple,
    // win_points: winPoint,
  });

  SuffleBots();
}

function createWinningCards(cards) {
  let andarCardType = generateRandomNo(CardsSet.Zero, CardsSet.Three);
  let baharCardType = generateRandomNo(CardsSet.Zero, CardsSet.Three);
  let winCardArr = [
    { card: cards[0], type: andarCardType },
    { card: cards[1], type: baharCardType },
  ];
  return winCardArr;
}

async function WinNosCalculator() {
  let totalLeftBets = SumOfARRAY(LeftBets) * 2;
  let totalMiddleBets = SumOfARRAY(MiddleBets) * 8;
  let totalRightBets = SumOfARRAY(RightBets) * 2;

  let winNo;
  let leastBetSpot;

  let bets = [totalLeftBets, totalMiddleBets, totalRightBets];
  //---------------------------------------------------------------------------------------------
  if (totalLeftBets === totalMiddleBets && totalMiddleBets === totalRightBets) {
    leastBetSpot = Math.floor(Math.random() * 10); //caculate random no form 0 to 9
    winNo = generateSpotWinningNo(leastBetSpot);
  } else {
    let leastBet = Math.min.apply(Math, bets); //minimum amount bet
    leastBetSpot = bets.indexOf(leastBet); //minimum  bet amount spot
    winNo = generateSpotWinningNo(leastBetSpot);
  }
  if (isbetPlaced == false) {
    Win_singleNo = Math.floor(Math.random() * 10);
    Win_doubleNo = Math.floor(Math.random() * 10);
    Win_tripleNo = Math.floor(Math.random() * 10);
  }
  let con_doubleNo = parseInt(
    Win_doubleNo.toString() + Win_singleNo.toString()
  );
  let con_tripleNo = parseInt(
    Win_tripleNo.toString() + Win_doubleNo.toString() + Win_singleNo.toString()
  );
  isbetPlaced = false;
  previousWin_single.push(Win_singleNo);
  previousWin_double.push(con_doubleNo);
  previousWin_triple.push(con_tripleNo);
  winPoint = 0;
  /* if(Win_singleNo==Win_doubleNo&& Win_doubleNo==Win_tripleNo&& usersingleNoChoice==userdoubleNoChoice&&userdoubleNoChoice==usertripleNoChoice&&usersingleNoChoice==Win_singleNo){
	winPoint=(Win_singleNo*100+Win_doubleNo*10+Win_tripleNo)*750;

}
else{
 */ if (usersingleNoChoice.indexOf(Win_singleNo) != -1) {
    winPoint =
      winPoint + singleNoBet[usersingleNoChoice.indexOf(Win_singleNo)] * 9;
  }
  if (userdoubleNoChoice.indexOf(con_doubleNo) != -1) {
    winPoint =
      winPoint + doubleNoBet[userdoubleNoChoice.indexOf(con_doubleNo)] * 90;
  }
  if (usertripleNoChoice.indexOf(con_tripleNo) != -1) {
    winPoint =
      winPoint + tripleNoBet[usertripleNoChoice.indexOf(con_tripleNo)] * 250;
  }

  if (playerName != "") {
    await service.addwinningpoint(playerName, winPoint);
  } //db

  //await service.updateUserPoint(playerName,winPoint)
  return {
    win_point: winPoint,
    singleNo: Win_singleNo,
    doubleNo: Win_doubleNo,
    tripleNo: Win_tripleNo,
    winNo: winNo,
    spot: leastBetSpot,
  };
  // return {Win_singleNo:Math.floor(Math.random() * 10),Win_doubleNo:Math.floor(Math.random() * 10),Win_tripleNo:Math.floor(Math.random() * 10),winNo:winNo,spot:leastBetSpot};

  //Single No, doubleNo,tripleNo
}

function generateSpotWinningNo(leastBetSpot) {
  let win1;
  let win2;
  switch (leastBetSpot) {
    case spot.left:
      win1 = Math.floor(GetRandomNo(2, 14));
      win2 = Math.floor(GetRandomNo(1, win1));
      break;
    case spot.middle:
      win1 = Math.floor(GetRandomNo(1, 14));
      win2 = win1;
      break;
    case spot.right:
      win2 = Math.floor(GetRandomNo(2, 14));
      win1 = Math.floor(GetRandomNo(1, win2));
      break;
    default:
      break;
  }
  return [win1, win2];
}

function SumOfARRAY(array) {
  return array.reduce(function (a, b) {
    return a + b;
  }, 0);
}
function GetRandomNo(min, max) {
  return Math.random() * (max - min) + min;
}

function PushWinNo(leastBetSpot) {
  if (previousWins != undefined) {
    previousWins.shift();
    previousWins.push(leastBetSpot);
    return previousWins;
  }
}

//OnSendWinNo=================================END============================================

//OnwinningAmount =>Calcuate winning Amount  =================================================

function CalculateBotsWinAmount(winningSpot) {
  for (let i = 0; i < BotsBetsDetails.length; i++) {
    //reset win no to zero
    let win = 0;
    if (winningSpot == 0) {
      BotsBetsDetails[i].win = BotsBetsDetails[i].left * LEFT_RIGHT_WIN_RATE;
      BotsBetsDetails[i].balance +=
        BotsBetsDetails[i].left * LEFT_RIGHT_WIN_RATE;
      win = BotsBetsDetails[i].left * LEFT_RIGHT_WIN_RATE;
    } else if (winningSpot === 1) {
      BotsBetsDetails[i].win = BotsBetsDetails[i].middle * MIDDLE_WIN_RATE;
      BotsBetsDetails[i].balance += BotsBetsDetails[i].middle * MIDDLE_WIN_RATE;
      win = BotsBetsDetails[i].middle * MIDDLE_WIN_RATE;
    } else {
      BotsBetsDetails[i].win = BotsBetsDetails[i].right * LEFT_RIGHT_WIN_RATE;
      BotsBetsDetails[i].balance +=
        BotsBetsDetails[i].right * LEFT_RIGHT_WIN_RATE;
      win = BotsBetsDetails[i].right * LEFT_RIGHT_WIN_RATE;
    }

    if (win === 0) {
      BotsBetsDetails[i].win = -(
        BotsBetsDetails[i].left +
        BotsBetsDetails[i].middle +
        BotsBetsDetails[i].right
      );
    }
  }
}

async function PlayersWinAmountCalculator(winningSpot) {
  for (let socketId in BetHolder) {
    let betData = BetHolder[socketId];

    if (winningSpot === 0) {
      betData[commonVar.win] = betData[0] * LEFT_RIGHT_WIN_RATE;
    } else if (winningSpot === 1) {
      betData[commonVar.win] = betData[1] * MIDDLE_WIN_RATE;
    } else {
      betData[commonVar.win] = betData[2] * LEFT_RIGHT_WIN_RATE;
    }

    BetHolder[socketId] = betData;

    // let winAmount = betData[commonVar.win] - (betData[0]+betData[1]+betData[2])
    // betData[commonVar.socket].emit(events.OnPlayerWin,{winAmount});

    if (betData[commonVar.win] > 0) {
      let winAmount =
        betData[commonVar.win] -
        betData[commonVar.win] * commonVar.adminCommisionRate;
      // console.log(
      //   "player " + betData[commonVar.playerId] + ` wins amount ${winAmount}`
      // );
      betData[commonVar.socket].emit(events.OnPlayerWin, { winAmount });
    } else {
      // console.log(
      //   `player ${betData[commonVar.playerId]} lost ${betData[0] + betData[1] + betData[2]
      //   } `
      // );
    }
  }

  //$- Add bet info to Database
  const playerWiningBalance = await service.updateWinningAmount({
    spot: winningSpot,
    room_id: timeStamp,
  });
  // console.log("Player bet info:");
  BetHolder = new Object();
}
//End OnwinningAmount =========================END============================================

//Create a bot, place and save bot bets=================================================================
const MAX_CHIPS_DATA = chipDataJson.length;
const MAX_BOTS_ON_SCREEN = 6;
const MAX_ITERATION = 8;
const Min_Wait_Time = 0.5;
const Max_Wait_Time = 2.5;
const BOT_CHIP_LIMIT = 500;
const MAX_TIME_BOTS_CAN_PLACE_BETS_IN_SINGLE_ROUND = 2;

function RegisterBots() {
  // register new bots only
  return new Promise(function (myResolve, myReject) {
    BotsBetsDetails = [];
    for (let i = 0; i < botManager.GetBots(gameId).length; i++) {
      let botBetTemplate = {
        name: "",
        left: 0, //this is left bets
        middle: 0, //this is middle bets
        right: 0, //this is right bets
        balance: 0, //this will assign just before the loops starts
        win: 0,
        avatarNumber: 0,
      };
      let botObj = botManager.GetBots(gameId)[i];
      botBetTemplate.balance = botObj.balance;
      botBetTemplate.name = botObj.name;
      botBetTemplate.avatarNumber = botObj.avatarNumber;
      BotsBetsDetails.push(botBetTemplate);
    }
  });
}

/**
 * Here  we add dulicate bets by bots
 * update bots balance and save bot bet on each spot
 * in BotsBetsDetails Array
 */
async function SendBotData() {
  let _leftBets = 0;
  let _middleBets = 0;
  let _rightBets = 0;
  let _botsBetCount = 0;
  while (!isTimeUp) {
    //this array contain random no from 0 to MAX_BOTS_DATA
    //this random number will used in frontent for bots
    let fakeOnlinePlayersBets = [];
    //SET BETS FOR ONLINE PLAYERS
    //IT WILL SHOW IN FRONTENT THAT ONLINE PLAYERS IS BETTING
    for (let i = 0; i < MAX_ITERATION; i++) {
      if (isTimeUp) break;
      let randomNO = Math.floor(GetRandomNo(0, MAX_CHIPS_DATA));
      fakeOnlinePlayersBets.push(randomNO);

      let spot = chipDataJson[randomNO].spot;
      let chip = chipDataJson[randomNO].chip;
      switch (spot) {
        case 0:
          _leftBets += chip;
          break;
        case 1:
          _middleBets += chip;
          break;
        case 2:
          _rightBets += chip;
          break;
        default:
          break;
      }
    }

    let botsBetHolder = [];

    let temp = {};
    let bots = Math.floor(GetRandomNo(0, MAX_BOTS_ON_SCREEN));
    _botsBetCount++;
    //SET BETS FOR BOTS
    if (_botsBetCount > MAX_TIME_BOTS_CAN_PLACE_BETS_IN_SINGLE_ROUND) {
      for (let i = 0; i < bots; i++) {
        if (isTimeUp) break;

        let botIndex = Math.floor(GetRandomNo(0, MAX_BOTS_ON_SCREEN));

        let dataIndex = Math.floor(GetRandomNo(0, MAX_CHIPS_DATA));
        while (chipDataJson[dataIndex].chip > BOT_CHIP_LIMIT) {
          dataIndex = Math.floor(GetRandomNo(0, MAX_CHIPS_DATA));
        }
        let botData = {
          botIndex, //this is just to identify bot on frontend
          dataIndex, //this will identify the index of chipdata index
        };

        botsBetHolder.push(botData);
        let spot = chipDataJson[dataIndex].spot;
        let chip = chipDataJson[dataIndex].chip;
        //this will only get from the fist six bots
        temp[i] = chipDataJson[dataIndex];
        BotsBetsDetails[botIndex].balance -= chip;
        switch (spot) {
          case 0:
            _leftBets += chip;
            BotsBetsDetails[botIndex].left += chip;
            break;
          case 1:
            _middleBets += chip;
            BotsBetsDetails[botIndex].middle += chip;
            break;
          case 2:
            _rightBets += chip;
            BotsBetsDetails[botIndex].right += chip;
            break;
          default:
            break;
        }
      }
    }

    Sockets.to(gameRoom).emit(events.OnBotsData, {
      onlinePlayersBets: fakeOnlinePlayersBets,
      botsBets: botsBetHolder,
    });
    let waitFor = GetRandomNo(Min_Wait_Time, Max_Wait_Time) * 500;
    await sleep(waitFor);
  }
  //  // console.log(BotsBetsDetails);
  fakeLeftBets = _leftBets;
  fakeMiddleBets = _middleBets;
  fakeRightBets = _rightBets;
}

function ResetBotsBets() {
  for (let i = 0; i < BotsBetsDetails.length; i++) {
    BotsBetsDetails[i].left = 0;
    BotsBetsDetails[i].middle = 0;
    BotsBetsDetails[i].right = 0;
  }
}

async function SuffleBots() {
  if (ROUND_COUNT % 5 === 0) {
    botManager.SuffleBots(gameId);
    await sleep(5);
    //register bots again
    RegisterBots();
  }
}

//Create a bot and player bot===================END=====================================================

//game timers------------------------------------------

//helper functions
let i = timerVar.bettingTripleChance;
let j = timerVar.betCalculationTimer;
let k = timerVar.waitTimer;
let isTimeUp = false;
let canPlaceBets = true;

async function ResetTimers() {
  let D = new Date();
  timeStamp = D.getTime();

  //ROUND_COUNT = (ROUND_COUNT === 5) ? 0 : ++ROUND_COUNT;
  ROUND_COUNT = ROUND_COUNT + 1;
  flags1 = 0;

  i = timerVar.bettingTripleChance;
  j = timerVar.betCalculationTimer;
  k = timerVar.waitTimer;

  LeftBets = [];
  MiddleBets = [];
  RightBets = [];

  ResetBotsBets();

  Sockets.to(gameRoom).emit(events.OnTimerStart, { result: i });
  // console.log("betting...tirplechance");
  isTimeUp = false;
  OnTimerStart();
  SendBotData();
}

async function OnTimerStart() {
  gameState = state.canBet;
  canPlaceBets = true;
  i--;

  //this will help to stop bots betting just before the round end
  if (i === 2) isTimeUp = true;

  if (i == 0) {
    await sleep(timerVar.intervalDalay);
    // console.log("timeUp Sevenup...");
    Sockets.to(gameRoom).emit(events.OnTimeUp);

    isTimeUp = true;
    OnTimeUp();
    return;
  }
  await sleep(timerVar.delay);
  OnTimerStart();
  //SendBotData();
}

async function OnTimeUp() {
  canPlaceBets = false;
  gameState = state.cannotBet;

  j--;
  // if (j === 8) OnSendWinNo();

  if (j === 1) {
    var Win_singleNorandom = Math.floor(Math.random() * 10);
    var Win_doubleNorandom = Math.floor(Math.random() * 9) + 1;
    var Win_tripleNorandom = Math.floor(Math.random() * 9) + 1;

    let con_doubleNo = parseInt(
      Win_doubleNorandom.toString() + Win_singleNorandom.toString()
    );
    let con_tripleNo = parseInt(
      Win_tripleNorandom.toString() +
      Win_doubleNorandom.toString() +
      Win_singleNorandom.toString()
    );
    var playerData = await service.GetAllplayer()
    //  // console.log(playerData)
    for (var index = 0; index < playerData.length; index++) {
      await OnWinNo({ playerId: playerData[index].playerId }, Win_singleNorandom, con_doubleNo, con_tripleNo)

    }

    /* playerData.forEach(item => {
      OnWinNo({playerId:item.playerId},Win_singleNorandom,con_doubleNo,con_tripleNo)
    }); */
    if (playerData.length > 0) {


      var adminWin = await service.getAdmintriplechance();
      if (
        adminWin.value1 == -1 &&
        adminWin.value2 == -1 &&
        adminWin.value3 == -1
      ) {

        //NewpreviousWin_single.pop;


        if (
          NewpreviousWin_single[NewpreviousWin_single.length - 1] !=
          Win_singleNorandom
        ) {
          NewpreviousWin_single.push(Win_singleNorandom);
        }
        if (
          NewpreviousWin_double[NewpreviousWin_double.length - 1] !=
          con_doubleNo
        ) {
          NewpreviousWin_double.push(con_doubleNo);
        }
        if (
          NewpreviousWin_triple[NewpreviousWin_triple.length - 1] !=
          con_tripleNo
        ) {
          NewpreviousWin_triple.push(con_tripleNo);
        }

        Sockets.to(gameRoom).emit(events.OnWinNo, {

          message: "wins",
          //winPoint: winPoint,
          winSingleNo: Win_singleNorandom,
          winDoubleNo: con_doubleNo,
          winTripleNo: con_tripleNo,

          // playerId: data.playerId,
          RoundCount: ROUND_COUNT,
          previousWins: NewpreviousWin_single,
          previousWinsDouble: NewpreviousWin_double,
          previousWinsTriple: NewpreviousWin_triple,

          //previousWin_single: previousWin_single,
          // Balance: point,
        });
        SuffleBots();


      }
      else {

        var Win_singleNorandom = adminWin.value1;
        var Win_doubleNorandom = adminWin.value2;
        var Win_tripleNorandom = adminWin.value3;

        let con_doubleNo = parseInt(
          Win_doubleNorandom.toString() + Win_singleNorandom.toString()
        );
        let con_tripleNo = parseInt(
          Win_tripleNorandom.toString() +
          Win_doubleNorandom.toString() +
          Win_singleNorandom.toString()
        );
        NewpreviousWin_single.push(Win_singleNorandom)
        NewpreviousWin_double.push(con_doubleNo)
        NewpreviousWin_triple.push(con_tripleNo)

        Sockets.to(gameRoom).emit(events.OnWinNo, {

          message: "wins",
          //winPoint: winPoint,
          winSingleNo: Win_singleNorandom,
          winDoubleNo: con_doubleNo,
          winTripleNo: con_tripleNo,

          // playerId: data.playerId,
          RoundCount: ROUND_COUNT,
          previousWins: NewpreviousWin_single,
          previousWinsDouble: NewpreviousWin_double,
          previousWinsTriple: NewpreviousWin_triple,

          //previousWin_single: previousWin_single,
          // Balance: point,
        });

      }

    }
    else {

      if (
        NewpreviousWin_single[NewpreviousWin_single.length - 1] !=
        Win_singleNorandom && Win_singleNorandom != 0
      ) {
        NewpreviousWin_single.push(Win_singleNorandom);
      }
      if (
        NewpreviousWin_double[NewpreviousWin_double.length - 1] != con_doubleNo && con_doubleNo != null
      ) {
        NewpreviousWin_double.push(con_doubleNo);
      }
      if (
        NewpreviousWin_triple[NewpreviousWin_triple.length - 1] != con_tripleNo && con_tripleNo != null
      ) {
        NewpreviousWin_triple.push(con_tripleNo);
      }

      Sockets.to(gameRoom).emit(events.OnWinNo, {

        message: "wins",
        //winPoint: 0,
        winSingleNo: Win_singleNorandom,
        winDoubleNo: con_doubleNo,
        winTripleNo: con_tripleNo,
        previousWins: NewpreviousWin_single,
        previousWinsDouble: NewpreviousWin_double,
        previousWinsTriple: NewpreviousWin_triple,

        // playerId: data.playerId,
        RoundCount: ROUND_COUNT,
        //previousWin_single: previousWin_single,
        //  Balance: point,
      });

      SuffleBots();


    }


    await service.RemovetripleBetsAll();
    await service.RemoveAllplayer();

    win_globalSingle = -1;
    win_globalifnoBetSingle = -1;
    win_globalDouble = -1;
    win_globalifnoBetDouble = -1;
    win_globalTriple = -1;
    win_globalifnoBetTriple = -1;

  }

  if (j === 0) {
    //round ended restart the timers
    /*  await sleep(timerVar.intervalDalay);
       // console.log("wait...");
     Sockets.to(gameRoom).emit(events.OnWait);
     OnWait();
  */
    ResetTimers();

    return;
  }
  await sleep(timerVar.delay);
  OnTimeUp();
}

async function OnWait() {
  gameState = state.wait;
  canPlaceBets = false;
  k--;

  if (k == 0) {
    //round ended restart the timers
    await sleep(timerVar.intervalDalay);
    ResetTimers();
    return;
  }
  await sleep(timerVar.delay);
  OnWait();
}

//game timers-----------------END-------------------------

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function generateRandomNo(min, max) {
  //min & max include
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//this even is only for debugging purposes
function OnTest(data) {
  let socket = data[commonVar.socket];
  socket.on(commonVar.test, (data) => {
    //service.updateWinningAmount({ spot:2, room_id:'1628516811811' });
    //SendBotData()
    //OnSendWinNo()
    console.table(BetHolder);
    // console.table(currentRoundData);
  });
}

module.exports.StartTripleChance = StartTripleChance;
module.exports.GetSocket = GetSocket;






















