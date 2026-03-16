"use strict";
const debug = require("debug")("test");
const DB_debug = require("debug")("db");
const service = require("../services/RouletteService");
const events = require("../Constants").events;
const commonVar = require("../Constants").commonVar;
const state = require("../Constants").state;
const spot = require("../Constants").spot;
const timerVar = require("../Constants").timerVar;
const gameId = 7;
const gameRoom = require("../Constants").selectGame[gameId];

const botManager = require("../utils/BotManager");
const playerManager = require("../utils/PlayerDataManager");
const AppService = require("../services/AppService");

//json
const chipDataJson = require("../jsonfiles/ChipsData.json");
const RandomWinAmounts = require("../jsonfiles/wins.json");

const LEFT_RIGHT_WIN_RATE = 2;
const MIDDLE_WIN_RATE = 8;
var flags1 = 0;
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
let NewpreviousWin_single = [1, 5, 11, 32, 23, 6, 7, 24]
let playerName = "";
let isbetPlaced = false;

let winPoint = 0;
let singleNoBet = [];
let Win_singleNo = 0;
let usersingleNoChoice = [];
let BetType = "";

//monik
let straightUp = [];
let straightUpVal = [];
let Split = [];
let SplitVal = [];
let Street = [];
let StreetVal = [];
let Corner = [];
let CornerVal = [];
let specificBet = [];
let specificBetVal = [];
let line = [];
let lineVal = [];
let dozen1 = [];
let dozen1Val = 0;
let dozen2 = [];
let dozen2Val = 0;
let dozen3 = [];
let dozen3Val = 0;

let column1 = [];
let column1Val = 0;

let column2 = [];
let column2Val = 0;
let column3 = [];
let column3Val = 0;

let onetoEighteen = [];
let onetoEighteenVal = 0;
let nineteentoThirtysix = [];
let nineteentoThirtysixVal = 0;

let even = [];
let evenVal = 0;
let odd = [];
let oddVal = 0;
let black = [];
let blackVal = 0;
let red = [];
let redVal = 0;

let Bet00 = 0
let Bet0 = 0

let Bet1 = 0
let Bet2 = 0
let Bet3 = 0
let Bet4 = 0
let Bet5 = 0
let Bet6 = 0
let Bet7 = 0
let Bet8 = 0
let Bet9 = 0
let Bet10 = 0
let Bet11 = 0
let Bet12 = 0
let Bet13 = 0
let Bet14 = 0
let Bet15 = 0
let Bet17 = 0
let Bet18 = 0
let Bet19 = 0
let Bet20 = 0
let Bet21 = 0
let Bet22 = 0
let Bet23 = 0
let Bet24 = 0
let Bet25 = 0
let Bet26 = 0
let Bet27 = 0
let Bet28 = 0
let Bet29 = 0
let Bet30 = 0
let Bet31 = 0
let Bet32 = 0
let Bet33 = 0
let Bet34 = 0
let Bet35 = 0
let Bet36 = 0

let totalPoint = 0;
var win_global = -1;
var win_globalifnoBet = -1;

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

function StartRouletteGame(data) {
  SendCurrentRoundInfo(data);
  OnChipMove(data);
  OnBetsPlaced(data);
  OnWinAmount(data);
  //(data);
  //OnDissConnected(data);
  gameHistoryRecord(data);
  OnleaveRoom(data);
  OnTest(data);
}

function OnleaveRoom(data) {
  let socket = data[commonVar.socket];
  socket.on(events.onleaveRoom, function (data) {
    try {
      // console.log('OnleaveRoom--rollet')
      socket.leave(gameRoom);
      socket.removeAllListeners(events.OnChipMove);
      socket.removeAllListeners(events.OnBetsPlaced);
      socket.removeAllListeners(events.OnWinNo);
      socket.removeAllListeners(events.OnTimeUp);
      socket.removeAllListeners(events.OnTimerStart);
      socket.removeAllListeners(events.OnCurrentTimer);

      socket.removeAllListeners(commonVar.test);
      socket.removeAllListeners(events.onleaveRoom);
      socket.removeAllListeners(events.OnHistoryRecord);
      playerManager.RemovePlayer(socket.id);
      socket.emit(events.onleaveRoom, {
        success: `successfully leave ${gameRoom} game.`,
      });
    } catch (err) {
      console.log(err);
    }
  });
}

//Game events
function OnBetsPlaced(data) {
  let socket = data[commonVar.socket];
  socket.on("OnBetsPlaced", async (data) => {
    // usersingleNoChoice = data.category;

    let userBalance = await service.onbalance(data.playerId);
    // console.log("-----------------OnBetsPlaced-rollet--------------", data);
    //   console.log(userBalance, "user");
    const betamount = data.totalstraightUpVal +
      data.totalSplitVal +
      data.totalStreetVal +
      data.totalCornerVal +
      data.totalspecificBetVal +
      data.totallineVal +
      data.totaldozen1Val +
      data.totaldozen2Val +
      data.totaldozen3Val +
      data.totalcolumn1Val +
      data.totalcolumn2Val +
      data.totalcolumn3Val +
      data.totalonetoEighteen +
      data.totalnineteentoThirtysix +
      data.totalevenVal +
      data.totalodd +
      data.totalblackVal +
      data.totalredVal;
    if (userBalance[0].point >= betamount) {
      playerName = data.playerId;

      //   console.log("bet request", data);
      await service.AddPlayerIdInBetplaced(data.playerId);

      straightUpVal = data.straightUpVal;
      straightUp = data.straightUp;

      SplitVal = data.SplitVal;
      Split = data.Split;

      StreetVal = data.StreetVal;
      Street = data.Street;

      CornerVal = data.CornerVal;
      Corner = data.Corner;

      specificBetVal = data.specificBetVal;
      specificBet = data.specificBet;

      lineVal = data.lineVal;
      line = data.line;

      dozen1Val = data.dozen1Val;
      dozen1 = data.dozen1;

      dozen2Val = data.dozen2Val;
      dozen2 = data.dozen2;

      dozen3Val = data.dozen3Val;
      dozen3 = data.dozen3;

      column1Val = data.column1Val;
      column1 = data.column1;

      column2Val = data.column2Val;
      column2 = data.column2;

      column3Val = data.column3Val;
      column3 = data.column3;

      onetoEighteenVal = data.onetoEighteenVal;
      onetoEighteen = data.onetoEighteen;

      nineteentoThirtysixVal = data.nineteentoThirtysixVal;
      nineteentoThirtysix = data.nineteentoThirtysix;

      evenVal = data.evenVal;
      even = data.even;

      oddVal = data.oddVal;
      odd = data.odd;

      blackVal = data.blackVal;
      black = data.black;

      redVal = data.redVal;
      red = data.red;

      isbetPlaced = true;
      //dedut balance
     await  AppService.addPointByEmail(data.playerId, -betamount);
      //   console.log("Point", point);
      await service.RouletteBets(
        data.totalstraightUpVal,
        data.totalSplitVal,
        data.totalStreetVal,
        data.totalCornerVal,
        data.totalspecificBetVal,
        data.totallineVal,
        data.totaldozen1Val,
        data.totaldozen2Val,
        data.totaldozen3Val,
        data.totalcolumn1Val,
        data.totalcolumn2Val,
        data.totalcolumn3Val,
        data.totalonetoEighteen,
        data.totalnineteentoThirtysix,
        data.totalevenVal,
        data.totalodd,
        data.totalblackVal,
        data.totalredVal,
        data.Bet00,
        data.Bet0,
        data.Bet1,
        data.Bet2,
        data.Bet3,
        data.Bet4,
        data.Bet5,
        data.Bet6,
        data.Bet7,
        data.Bet8,
        data.Bet9,
        data.Bet10,
        data.Bet11,
        data.Bet12,
        data.Bet13,
        data.Bet14,
        data.Bet15,
        data.Bet16,
        data.Bet17,
        data.Bet18,
        data.Bet19,
        data.Bet20,
        data.Bet21,
        data.Bet22,
        data.Bet23,
        data.Bet24,
        data.Bet25,
        data.Bet26,
        data.Bet27,
        data.Bet28,
        data.Bet29,
        data.Bet30,
        data.Bet31,
        data.Bet32,
        data.Bet33,
        data.Bet34,
        data.Bet35,
        data.Bet36,
        data.Bet00Value,
        data.Bet0Value,
        data.Bet1Value,
        data.Bet2Value,
        data.Bet3Value,
        data.Bet4Value,
        data.Bet5Value,
        data.Bet6Value,
        data.Bet7Value,
        data.Bet8Value,
        data.Bet9Value,
        data.Bet10Value,
        data.Bet11Value,
        data.Bet12Value,
        data.Bet13Value,
        data.Bet14Value,
        data.Bet15Value,
        data.Bet16Value,
        data.Bet17Value,
        data.Bet18Value,
        data.Bet19Value,
        data.Bet20Value,
        data.Bet21Value,
        data.Bet22Value,
        data.Bet23Value,
        data.Bet24Value,
        data.Bet25Value,
        data.Bet26Value,
        data.Bet27Value,
        data.Bet28Value,
        data.Bet29Value,
        data.Bet30Value,
        data.Bet31Value,
        data.Bet32Value,
        data.Bet33Value,
        data.Bet34Value,
        data.Bet35Value,
        data.Bet36Value

      );
//record game
       await service.GameRunning(
        data.playerId,
        ROUND_COUNT,
        JSON.stringify(straightUp),
        JSON.stringify(Split),
        JSON.stringify(Street),
        JSON.stringify(Corner),
        JSON.stringify(specificBet),
        JSON.stringify(line),
        JSON.stringify(dozen1),
        JSON.stringify(dozen2),
        JSON.stringify(dozen3),
        JSON.stringify(column1),
        JSON.stringify(column2),
        JSON.stringify(column3),
        JSON.stringify(onetoEighteen),
        JSON.stringify(nineteentoThirtysix),
        JSON.stringify(even),

        JSON.stringify(odd),
        JSON.stringify(black),
        JSON.stringify(red),

        JSON.stringify(straightUpVal),
        JSON.stringify(SplitVal),
        JSON.stringify(StreetVal),
        JSON.stringify(CornerVal),
        JSON.stringify(specificBetVal),
        JSON.stringify(lineVal),
        JSON.stringify(dozen1Val),
        JSON.stringify(dozen2Val),
        JSON.stringify(dozen3Val),
        JSON.stringify(column1Val),
        JSON.stringify(column2Val),
        JSON.stringify(column3Val),
        JSON.stringify(onetoEighteenVal),
        JSON.stringify(nineteentoThirtysixVal),
        JSON.stringify(evenVal),

        JSON.stringify(oddVal),
        JSON.stringify(blackVal),
        JSON.stringify(redVal),
        Win_singleNo, userBalance[0].idManager, betamount, timeStamp
      );
      //   console.log("Game", Game);

      if (betamount == 0) {
        /* && data.doubleNo.length==0 && data.triple.length==0) */ socket.emit(
        events.OnBetsPlaced,
        {
          status: 400,
          message: "Bet not Confirmed",
          data: {
            playerId: data.playerId,
            balance: (userBalance[0].point - betamount)

          },
        }
      );
      } else {
        socket.emit(events.OnBetsPlaced, {
          status: 200,
          message: "Bet Confirmed",
          data: {
            playerId: data.playerId,
            balance: (userBalance[0].point - betamount)

          },
        });
      }
    } else {
      socket.emit(events.OnBetsPlaced, {
        status: 200,
        message: "insufficient balance ,Please add balance to your account",
        data: {
          playerId: data.playerId,
        },
      });
    }
  });
}

async function OnWinNo(data, W) {
  //   console.log("W----",W)
  
  var winpoint1 = 0
  var game_id = 7;
  var previousWin_single = previousWin_single;

  var isplayerexist = await service.GetPlayerIdInBetplaced(data.playerId);
  if (isplayerexist == true) {
    let Game = await service.GetGameRunningData(data.playerId);
    if (Game == "no user data exits") {
      // socket.emit("OnWinNo", { message: "no user data exits" });
    } else {
      //   console.log("Win_singleNo", W);

      if (JSON.parse(Game.straightUpVal).length != 0) {
        if (JSON.parse(Game.straightUp).indexOf(W) != -1) {
          winpoint1 = winpoint1 + JSON.parse(Game.straightUpVal)[JSON.parse(Game.straightUp).indexOf(W)] * 36; //kitn lgn hai
        }
      }



      if (JSON.parse(Game.SplitVal).length != 0) {
        JSON.parse(Game.Split).forEach((item, index) => {
          if (item.indexOf(W) != -1) {
            //   console.log("imporantpoint",parseInt(JSON.parse(Game.SplitVal)[index]) * 18)
            //   console.log("length",Game.SplitVal.length," ", Game.Split.length)
            winpoint1 = winpoint1 + parseInt(JSON.parse(Game.SplitVal)[index]) * 18; //kitn lgn hai
            //winPoint=winPoint+singleNoBet[[usersingleNoChoice.indexOf( W)],[usersingleNoChoice.indexOf( W)]]*17  //kitn lgn hai
          }
        });
      }

      if (JSON.parse(Game.StreetVal).length != 0) {
        JSON.parse(Game.Street).forEach((item, index) => {
          if (item.indexOf(W) != -1) {
            //   console.log("imporantpoint",parseInt(JSON.parse(Game.StreetVal)[index]) * 12)
            winpoint1 = winpoint1 + parseInt(JSON.parse(Game.StreetVal)[index]) * 12; //kitn lgn hai
            //winPoint=winPoint+singleNoBet[[usersingleNoChoice.indexOf( W)],[usersingleNoChoice.indexOf( W)]]*17  //kitn lgn hai
          }
        });
      }
      if (JSON.parse(Game.CornerVal).length != 0) {
        JSON.parse(Game.Corner).forEach((item, index) => {
          if (item.indexOf(W) != -1) {
            //   console.log("imporantpoint",parseInt(JSON.parse(Game.CornerVal)[index] )* 9)
            winpoint1 = winpoint1 + parseInt(JSON.parse(Game.CornerVal)[index]) * 9; //kitn lgn hai
            //winPoint=winPoint+singleNoBet[[usersingleNoChoice.indexOf( W)],[usersingleNoChoice.indexOf( W)]]*17  //kitn lgn hai
          }
        });
      }


      if (JSON.parse(Game.lineVal).length != 0) {
        JSON.parse(Game.line).forEach((item, index) => {
          if (item.indexOf(W) != -1) {
            //   console.log("imporantpoint",parseInt(JSON.parse(Game.lineVal)[index] )* 6)
            winpoint1 = winpoint1 + parseInt(JSON.parse(Game.lineVal)[index]) * 6; //kitn lgn hai
            //winPoint=winPoint+singleNoBet[[usersingleNoChoice.indexOf( W)],[usersingleNoChoice.indexOf( W)]]*17  //kitn lgn hai
          }
        });
      }

      if (JSON.parse(Game.specificBetVal).length != 0) {
        if ([0, "00", 1, 2, 3].indexOf(W) != -1) {
          winpoint1 = winpoint1 + (JSON.parse(Game.specificBetVal)[JSON.parse(Game.specificBet).indexOf(W)]) * 7; //kitn lgn hai
        }
      }


      if (JSON.parse(Game.dozen1Val) > 0) {
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].indexOf(W) != -1) {
          winpoint1 = winpoint1 + JSON.parse(Game.dozen1Val) * 3; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.dozen2Val) > 0) {
        if (
          [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].indexOf(W) !=
          -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.dozen2Val) * 3; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.dozen3Val) > 0) {
        if (
          [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].indexOf(W) !=
          -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.dozen3Val) * 3; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.column1Val) > 0) {
        if (
          [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.column1Val) * 3; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.column2Val) > 0) {
        if (
          [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.column2Val) * 3; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.column3Val) > 0) {
        if (
          [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.column3Val) * 3; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.onetoEighteenVal) > 0) {
        if (
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].indexOf(
            W
          ) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.onetoEighteenVal) * 2; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.nineteentoThirtysixVal) > 0) {
        if (
          [
            19, 20, 21.22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
          ].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.nineteentoThirtysixVal) * 2; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.redVal) > 0) {
        if (
          [
            1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
          ].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.redVal) * 2; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.blackVal) > 0) {
        if (
          [
            2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
          ].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.blackVal) * 2; //kitn lgn hai
        }
      }
      if (JSON.parse(Game.oddVal) > 0) {
        if (
          [
            1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35,
          ].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.oddVal) * 2; //kitn lgn hai
        }
      }

      if (JSON.parse(Game.evenVal) > 0) {
        if (
          [
            2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36,
          ].indexOf(W) != -1
        ) {
          winpoint1 = winpoint1 + JSON.parse(Game.evenVal) * 2; //kitn lgn hai
        }
      }

      // console.log("Playerid winpoint1", data.playerId, winpoint1)

      /* await service.RemovePlayerIdInBetplaced(data.playerId); */
        service.UpdateGameRunningDataWinSingleNumber(
        data.playerId,
        Game.playedTime,
        W, winpoint1
      );
        service.WinamountDetails(data.playerId, game_id, winpoint1);
        AppService.dailyReport(data.playerId, Game.idManager, Game.betpoint, winpoint1);
    

    }
  }
  // //   console.log("Game", Game);
}



/* function OnWinAmount(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnWinAmount, async (data) => {
   //   console.log("winAmount hit", data);
    await service.updateUserPoint(data.playerId, data.win_points);
    socket.emit(events.OnWinAmount, {
      win_no: Win_singleNo,
      RoundCount: ROUND_COUNT,
      win_point: winPoint,
      playerId: playerName,
    });
  });
}
 */


function OnWinAmount(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnWinAmount, async (data) => {
    console.error("OnWinAmount hit", data);
    //  await service.updateUserPoint(data.playerId, data.win_points);
    let point = await service.updateUserPoint(
      data.playerId,
      // Game.singleNo * 2.2
      //data.point
      data.winpoint,
    );
    //   console.log("Points", point);
    socket.emit(events.OnWinAmount, {
      /* win_no: Win_singleNo,
      RoundCount: ROUND_COUNT,
  */     //win_point: data.winpoint,
      playerId: data.playerId,
      Balance: point,
      message: "point added in user account"
    });
  });
}

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

  let player = await addPlayerToRoom(data);
  await service.updateUserPoint(data.playerId, data.win_points);


  let obj = {
    gametimer: i,
    RoundCount: ROUND_COUNT,

    // timer,
    // gameState,
    // socketId : player.socketId,
    previousWins: NewpreviousWin_single,
    botsBetsDetails: BotsBetsDetails,
    //balance: player.balance,
    winamount: data.winPoint,


  };//
  // console.log("winpoint", winPoint)
  socket.emit(events.OnCurrentTimer, obj);
}

//Game History Record=====================================================================
function gameHistoryRecord(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnHistoryRecord, async function (data) {
    // console.log('OnHistoryRecord')
    let matrixRecord = await service.gameMartixRecords();
    let slotRecord = await service.gameSlotRecords();
    //socket.emit(events.OnHistoryRecord, { matrixRecord, slotRecord });
    let historydetail = await service.GetGameHistoryGameRunningData();//
    // console.log("GetGameHistoryGameRunningData", historydetail)
    var history = []
    historydetail.forEach((iteam) => {
      history.push(iteam.Win_singleNo)
    });//
    // console.log("history", history)
    socket.emit(events.OnHistoryRecord, { matrixRecord: history });
  });
}
//====================================END=================================================

//On Chip Move =>Save all user Bet==================================================

function OnChipMove(D) {
  let socket = D[commonVar.socket];
  socket.on(events.OnChipMove, (data) => {
    // console.log('OnChipMove')
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

//On OnSendWinNo =>Calcuate game Winning No when j==8 ======================================
function GetRandomNo(min, max) {
  return Math.random() * (max - min) + min;
}


//OnSendWinNo=================================END============================================

//OnwinningAmount =>Calcuate winning Amount  =================================================

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
  //  console.log(BotsBetsDetails);
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
let i = timerVar.bettingRoulette;
let j = timerVar.betCalculationTimer;
let k = timerVar.waitTimer;
let isTimeUp = false;
let canPlaceBets = true;

async function ResetTimers() {
  let D = new Date();
  timeStamp = D.getTime();

  //  ROUND_COUNT = (ROUND_COUNT === 5) ? 0 : ++ROUND_COUNT;
  ROUND_COUNT = ROUND_COUNT + 1;
  flags1 = 0;
  i = timerVar.bettingRoulette;
  j = timerVar.betCalculationTimer;
  k = timerVar.waitTimer;

  LeftBets = [];
  MiddleBets = [];
  RightBets = [];

  ResetBotsBets();

  Sockets.to(gameRoom).emit(events.OnTimerStart, { result: i });
  // console.log("ResetTimers-betting...", i, j, k);
  isTimeUp = false;
  OnTimerStart();
  SendBotData();
}

async function OnTimerStart() {
  //   console.log("OnTimerStart-start",i,j,k);
  gameState = state.canBet;
  canPlaceBets = true;
  i--;

  //this will help to stop bots betting just before the round end
  if (i === 2) isTimeUp = true;
  if (i == 0) {

    //  await sleep(timerVar.intervalDalay);
    // console.log("Rollet>timeUp...", i, j);
    Sockets.to(gameRoom).emit(events.OnTimeUp);

    isTimeUp = true;
    OnTimeUp();

    return;
  }
  await sleep(timerVar.delay);
  OnTimerStart();
  //SendBotData();
}
////////////Decalre Result //////////////////////
async function OnTimeUp() {
  canPlaceBets = false;
  gameState = state.cannotBet;

  j--;

  //if (j === 8) OnSendWinNo();delay 8 to 1
  if (j == 1) {
    var winconatinzero = []
    var playerData = await service.GetAllplayer()
    //   console.log(playerData)


    if (playerData.length > 0) {

      var Roulette_betsResult = await service.Detailroulete();
      //   console.log("Detailroulete", Roulette_betsResult);

      var objectKey = Object.keys(Roulette_betsResult).map(function (key) { return key; })
      // objectKey.shift()
      //   console.log("objectKey",objectKey)
      var objectValue = Object.keys(Roulette_betsResult).map(function (key) { return Roulette_betsResult[key]; })
      // objectValue.shift()
      //   console.log("objectValue",objectValue)
      var minimumValue = Math.min(...objectValue)//
      // console.log('minimum value', minimumValue)
      var minimumIndex = objectValue.indexOf(minimumValue)
      if (minimumIndex == 0) {
        Win_singleNo = 37
      }
      else {
        Win_singleNo = minimumIndex - 1
      }
      if (Roulette_betsResult.bet0 == 0) {
        winconatinzero.push(0);
      }
      if (Roulette_betsResult.bet1 == 0) {
        winconatinzero.push(1);
      }
      if (Roulette_betsResult.bet2 == 0) {
        winconatinzero.push(2);
      }
      if (Roulette_betsResult.bet3 == 0) {
        winconatinzero.push(3);
      }
      if (Roulette_betsResult.bet4 == 0) {
        winconatinzero.push(4);
      }
      if (Roulette_betsResult.bet5 == 0) {
        winconatinzero.push(5);
      }
      if (Roulette_betsResult.bet6 == 0) {
        winconatinzero.push(6);
      }
      if (Roulette_betsResult.bet7 == 0) {
        winconatinzero.push(7);
      }
      if (Roulette_betsResult.bet8 == 0) {
        winconatinzero.push(8);
      }
      if (Roulette_betsResult.bet9 == 0) {
        winconatinzero.push(9);
      }
      if (Roulette_betsResult.bet10 == 0) {
        winconatinzero.push(10);
      }
      if (Roulette_betsResult.bet11 == 0) {
        winconatinzero.push(11);
      }
      if (Roulette_betsResult.bet12 == 0) {
        winconatinzero.push(12);
      }

      if (Roulette_betsResult.bet13 == 0) {
        winconatinzero.push(13);
      }

      if (Roulette_betsResult.bet14 == 0) {
        winconatinzero.push(14);
      }

      if (Roulette_betsResult.bet15 == 0) {
        winconatinzero.push(15);
      }

      if (Roulette_betsResult.bet16 == 0) {
        winconatinzero.push(16);
      }
      if (Roulette_betsResult.bet17 == 0) {
        winconatinzero.push(17);
      }
      if (Roulette_betsResult.bet18 == 0) {
        winconatinzero.push(18);
      }
      if (Roulette_betsResult.bet19 == 0) {
        winconatinzero.push(19);
      }
      if (Roulette_betsResult.bet20 == 0) {
        winconatinzero.push(20);
      }
      if (Roulette_betsResult.bet21 == 0) {
        winconatinzero.push(21);
      }
      if (Roulette_betsResult.bet22 == 0) {
        winconatinzero.push(22);
      }
      if (Roulette_betsResult.bet23 == 0) {
        winconatinzero.push(23);
      }
      if (Roulette_betsResult.bet24 == 0) {
        winconatinzero.push(24);
      }
      if (Roulette_betsResult.bet25 == 0) {
        winconatinzero.push(25);
      }
      if (Roulette_betsResult.bet26 == 0) {
        winconatinzero.push(26);
      }
      if (Roulette_betsResult.bet27 == 0) {
        winconatinzero.push(27);
      }
      if (Roulette_betsResult.bet28 == 0) {
        winconatinzero.push(28);
      }
      if (Roulette_betsResult.bet29 == 0) {
        winconatinzero.push(29);
      }
      if (Roulette_betsResult.bet30 == 0) {
        winconatinzero.push(30);
      }
      if (Roulette_betsResult.bet31 == 0) {
        winconatinzero.push(31);
      }
      if (Roulette_betsResult.bet32 == 0) {
        winconatinzero.push(32);
      }
      if (Roulette_betsResult.bet33 == 0) {
        winconatinzero.push(33);
      }
      if (Roulette_betsResult.bet34 == 0) {
        winconatinzero.push(34);
      }
      if (Roulette_betsResult.bet35 == 0) {
        winconatinzero.push(35);
      }
      if (Roulette_betsResult.bet36 == 0) {
        winconatinzero.push(36);
      }
      if (Roulette_betsResult.bet00 == 0) {
        winconatinzero.push(37);
      }

      var adminWin = await service.getAdminroulette()

      if (
        adminWin.value == -1) {
        // console.log("wincon--------------------", winconatinzero)

        if (winconatinzero.length > 0) {
          let l = winconatinzero.length;
          let r = Math.floor(Math.random() * l);
          Win_singleNo = winconatinzero[r];
        }

        // console.log('Win_singleNo-rollet', Win_singleNo);

        //Update every player game record
        playerData.forEach(item => {
          OnWinNo({ playerId: item.playerId }, Win_singleNo)
        });

        NewpreviousWin_single.push(Win_singleNo.toString())

        Sockets.to(gameRoom).emit(events.OnWinNo, {
          message: " wins",
          winNo: Win_singleNo,
          RoundCount: ROUND_COUNT,
          previousWin_single: NewpreviousWin_single,
        });
      }
      else {
        Win_singleNo = adminWin.value
        NewpreviousWin_single.push(Win_singleNo)
        //update db
        for (var index = 0; index < playerData.length; index++) {
          await OnWinNo({ playerId: playerData[index].playerId }, Win_singleNo)

        }

        Sockets.to(gameRoom).emit(events.OnWinNo, {

          message: " wins",

          winNo: Win_singleNo,
          RoundCount: ROUND_COUNT,

          previousWin_single: NewpreviousWin_single,

        });
      }
      await service.RemoveRouletteBetsAll();
      await service.RemoveAllplayer();

      win_global = -1;
      win_globalifnoBet = -1;



    }
    else {
      var Win = 0;
      var winNo = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
      ];

      var l = winNo.length;
      var r = Math.floor(Math.random() * l);
      Win = winNo[r];

      if (NewpreviousWin_single[NewpreviousWin_single.length - 1] != Win) {
        NewpreviousWin_single.push(Win);
      }

      Sockets.to(gameRoom).emit(events.OnWinNo, {
        winNo: Win,
        RoundCount: ROUND_COUNT,
        previousWin_single: NewpreviousWin_single,
      });

      SuffleBots();
    }

  }

  if (j === 0) {
    //round ended restart the timers
    // console.log('resttimer()', i, j);
    ResetTimers();
    return;
  }

  await sleep(timerVar.delay);
  OnTimeUp();
}


//game timers-----------------END-------------------------

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

//this even is only for debugging purposes
function OnTest(data) {
  let socket = data[commonVar.socket];
  socket.on(commonVar.test, (data) => {
    console.table(BetHolder);
  });
}

module.exports.StartRouletteGame = StartRouletteGame;
module.exports.GetSocket = GetSocket;
