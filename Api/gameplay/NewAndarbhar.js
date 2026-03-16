"use strict";
const debug = require("debug")("test");
const DB_debug = require("debug")("db");
const service = require("../services/NewAndarbharGameService");
const events = require("../Constants").events;
const commonVar = require("../Constants").commonVar;
const state = require("../Constants").state;
const spot = require("../Constants").spot;
const timerVar = require("../Constants").timerVar;
const gameId = 3;
const gameRoom = require("../Constants").selectGame[gameId];
const CardsSet = require("../Constants").setOfCards;

const botManager = require("../utils/BotManager");
const playerManager = require("../utils/PlayerDataManager");

//json
const chipDataJson = require("../jsonfiles/ChipsData.json");
const RandomWinAmounts = require("../jsonfiles/wins.json");
const AppService = require("../services/AppService");

const LEFT_RIGHT_WIN_RATE = 2;
const MIDDLE_WIN_RATE = 8;
let flags1 = 0;
let Sockets;
let gameState;

let currentRoundData = {}; //this will users bets, playerId and spot
let BetHolder = new Object(); //user bet on each spot sum
let LeftBets = [];
let MiddleBets = [];
let RightBets = [];
 

let timeStamp; //as room id(change after 30 sec)
let ROUND_COUNT = 0; //reset to 0 after 5 round

let previousWin_single = [1, 2, 3, 5, 23, 34, 22, 45, 12, 20];
let NewpreviousWin_single = [1, 2, 3, 5, 23, 34, 22, 45, 12, 20];
  // Given card number object
  const cardno = {
    Card_A_amount: 0,
    Card_2_amount: 1,
    Card_3_amount: 2,
    Card_4_amount: 3,
    Card_5_amount: 4,
    Card_6_amount: 5,
    Card_7_amount: 6,
    Card_8_amount: 7,
    Card_9_amount: 8,
    Card_10_amount: 9,
    Card_J_amount: 10,
    Card_Q_amount: 11,
    Card_K_amount: 12
  };
  const cardMapping = {
    "heart": [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    "spade": [39, 40, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 51],
    "club": [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    "diamond": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  };

  let random_card_andar = [48, 47,32 ,26, 29];
  let random_card_bahar = [ 14,15,20,21];

let BotsBetsDetails = []; //Array of 6 bots with amount of bet on each spot (array filled by RegisterBots ↓)

let Win_singleNo = [];
 
let win_global = -1;
let win_globalifnoBet = -1;
let win_AndarBaharifnoBet = -1;

let Andar_Card_List = [14, 24, 4, 34, 2];
let Bahar_Card_List = [8, 26, 15, 3, 22];


let previousWins = new Array(5);
let isbetPlaced = false

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

function StartNewAndarbharGame(data) {
  SendCurrentRoundInfo(data);
  OnChipMove(data);
  OnBetsPlaced(data);
  OnWinAmount(data)
    // OnWinNo(data);
    ;
  //OnDissConnected(data);
  gameHistoryRecord(data);
  OnleaveRoom(data);
  OnTest(data);
}

function OnleaveRoom(data) {
  let socket = data[commonVar.socket];
  socket.on(events.onleaveRoom, function (data) {
    try {
      console.log('OnleaveRoom--Andarnew')
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
  socket.on(events.OnBetsPlaced, async (data) => {
    // socket.to(gameRoom).emit(events.OnChipMove, data);
    console.log("bet request-newandar", data);
    let userBalance = await service.onbalance(data.playerId);
    let idManager = userBalance[0].idManager;
    let total_bet_amount = data.Card_A_amount +
      data.Card_2_amount +
      data.Card_3_amount +
      data.Card_4_amount +
      data.Card_5_amount +
      data.Card_6_amount +
      data.Card_7_amount +
      data.Card_8_amount +
      data.Card_9_amount +
      data.Card_10_amount +
      data.Card_J_amount +
      data.Card_Q_amount +
      data.Card_K_amount +
      data.Card_Heart_amount +
      data.Card_Diamond_amount +
      data.Card_Club_amount +
      data.Card_Spade_amount +
      data.Card_Red_amount +
      data.Card_Black_amount +
      data.Card_A_6_amount +
      data.Card_seven_amount +
      data.Card_8_K_amount +
      data.Card_Andhar_amount +
      data.Card_Bahar_amount
      ;
    if (userBalance[0].point >= total_bet_amount) {

      await service.AddPlayerIdInBetplaced(data.playerId);
      let point = await service.getUserPoint(
        data.playerId,
        total_bet_amount,
      );
 
      await service.AndarBaharBets(
        data.Card_A_amount,
        data.Card_2_amount,
        data.Card_3_amount,
        data.Card_4_amount,
        data.Card_5_amount,
        data.Card_6_amount,
        data.Card_7_amount,
        data.Card_8_amount,
        data.Card_9_amount,
        data.Card_10_amount,
        data.Card_J_amount,
        data.Card_Q_amount,
        data.Card_K_amount,
        data.Card_Heart_amount,
        data.Card_Diamond_amount,
        data.Card_Club_amount,
        data.Card_Spade_amount,
        data.Card_Red_amount,
        data.Card_Black_amount,
        data.Card_A_6_amount,
        data.Card_seven_amount,
        data.Card_8_K_amount,
        data.Card_Andhar_amount,
        data.Card_Bahar_amount
      );

      let Game = await service.GameRunning(
        data.playerId,
        ROUND_COUNT,
        data.Card_A_amount,
        data.Card_2_amount,
        data.Card_3_amount,
        data.Card_4_amount,
        data.Card_5_amount,
        data.Card_6_amount,
        data.Card_7_amount,
        data.Card_8_amount,
        data.Card_9_amount,
        data.Card_10_amount,
        data.Card_J_amount,
        data.Card_Q_amount,
        data.Card_K_amount,
        data.Card_Heart_amount,
        data.Card_Diamond_amount,
        data.Card_Club_amount,
        data.Card_Spade_amount,
        data.Card_Red_amount,
        data.Card_Black_amount,
        data.Card_A_6_amount,
        data.Card_seven_amount,
        data.Card_8_K_amount,
        data.Card_Andhar_amount,
        data.Card_Bahar_amount,

        Win_singleNo = undefined,
        idManager, total_bet_amount, timeStamp
      );

      if (
        data.Card_A_amount == 0 &&
        data.Card_2_amount == 0 &&
        data.Card_3_amount == 0 &&
        data.Card_4_amount == 0 &&
        data.Card_5_amount == 0 &&
        data.Card_6_amount == 0 &&
        data.Card_7_amount == 0 &&
        data.Card_8_amount == 0 &&
        data.Card_9_amount == 0 &&
        data.Card_10_amount == 0 &&
        data.Card_J_amount == 0 &&
        data.Card_Q_amount == 0 &&
        data.Card_K_amount == 0 &&
        data.Card_Heart_amount == 0 &&
        data.Card_Diamond_amount == 0 &&
        data.Card_Spade_amount == 0 &&
        data.Card_Club_amount == 0 &&
        data.Card_Red_amount == 0 &&
        data.Card_Black_amount == 0 &&
        data.Card_A_6_amount == 0 &&
        data.Card_seven_amount == 0 &&
        data.Card_8_k_amount == 0 &&
        data.Card_Andhar_amount == 0 &&
        data.Card_Bahar_amount == 0
      ) {
        socket.emit(events.OnBetsPlaced, {
          status: 400,
          message: "Bet not Confirmed",
          data: {
            playerId: data.playerId,
            balance:
              point -
              (data.Card_A_amount +
                data.Card_2_amount +
                data.Card_3_amount +
                data.Card_4_amount +
                data.Card_5_amount +
                data.Card_6_amount +
                data.Card_7_amount +
                data.Card_8_amount +
                data.Card_9_amount +
                data.Card_10_amount +
                data.Card_J_amount +
                data.Card_Q_amount +
                data.Card_K_amount +
                data.Card_Heart_amount +
                data.Card_Diamond_amount +
                data.Card_Spade_amount +
                data.Card_Club_amount +
                data.Card_Red_amount +
                data.Card_Black_amount +
                data.Card_A_6_amount +
                data.Card_seven_amount +
                data.Card_8_K_amount +
                data.Card_Andhar_amount +
                data.Card_Bahar_amount),
          },
        });
      } else {
        socket.emit(events.OnBetsPlaced, {
          status: 200,
          message: "Bet Confirmed",
          data: {
            playerId: data.playerId,
            balance:
              point -
              (data.Card_A_amount +
                data.Card_2_amount +
                data.Card_3_amount +
                data.Card_4_amount +
                data.Card_5_amount +
                data.Card_6_amount +
                data.Card_7_amount +
                data.Card_8_amount +
                data.Card_9_amount +
                data.Card_10_amount +
                data.Card_J_amount +
                data.Card_Q_amount +
                data.Card_K_amount +
                data.Card_Heart_amount +
                data.Card_Diamond_amount +
                data.Card_Spade_amount +
                data.Card_Club_amount +
                data.Card_Red_amount +
                data.Card_Black_amount +
                data.Card_A_6_amount +
                data.Card_seven_amount +
                data.Card_8_K_amount +
                data.Card_Andhar_amount +
                data.Card_Bahar_amount),
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





async function OnWinNo(data, Win_singleNo, random_andhar_bahar) {
  console.log('Result-----UPdating datata -', data, Win_singleNo, random_andhar_bahar);
  let game_id = 3;
  let winPoint = 0;
  let Game = await service.GetGameRunningData(data.playerId);
  if (Game == "no user data exits") {
    //  socket.emit("OnWinNo", { message: "no user data exits" });
  } else {
    let AndarBahar_betsResult = await service.DetailAndarBahar();
    // console.log("DetailAndarBahar", AndarBahar_betsResult);       

    await service.UpdateGameRunningDataWinSingleNumber(
      data.playerId,
      Game.playedTime,
      Win_singleNo
    );


    if (Game.Card_A_amount != 0 && [0, 13, 26, 39].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_A_amount * 12;
    }

    if (Game.Card_2_amount != 0 && [1, 14, 27, 40].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_2_amount * 12;
    }

    if (Game.Card_3_amount != 0 && [2, 15, 28, 41].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_3_amount * 12;
    }
    if (Game.Card_4_amount != 0 && [3, 16, 29, 42].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_4_amount * 12;
    }


    if (Game.Card_5_amount != 0 && [4, 17, 30, 43].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_5_amount * 12;
    }

    if (Game.Card_6_amount != 0 && [5, 18, 31, 44].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_6_amount * 12;
    }
    if (Game.Card_7_amount != 0 && [6, 19, 32, 45].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_7_amount * 12;
    }

    if (Game.Card_8_amount != 0 && [7, 20, 33, 46].indexOf(Win_singleNo) != -1) {

      winPoint = winPoint + Game.Card_8_amount * 12;
    }

    if (Game.Card_9_amount != 0 && [8, 21, 34, 47].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_9_amount * 12;
    }

    if (Game.Card_10_amount != 0 && [9, 22, 35, 48].indexOf(Win_singleNo) != -1) {

      winPoint = winPoint + Game.Card_10_amount * 12;
    }

    if (Game.Card_J_amount != 0 && [10, 23, 36, 49].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_J_amount * 12;
    }

    if (Game.Card_Q_amount != 0 && [11, 24, 37, 50].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_Q_amount * 12;
    }

    if (Game.Card_K_amount != 0 && [13, 25, 38, 51].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_K_amount * 12;
    }


    if (
      Game.Card_Heart_amount != 0 &&
      [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].indexOf(
        Win_singleNo
      ) != -1
    ) {
      winPoint = winPoint + Game.Card_Heart_amount * 3.7;
    }

    if (
      Game.Card_Spade_amount != 0 &&
      [39, 40, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 51].indexOf(
        Win_singleNo
      ) != -1
    ) {
      winPoint = winPoint + Game.Card_Spade_amount * 3.7; /*------------x9*/
    }

    if (
      Game.Card_Club_amount != 0 &&
      [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38].indexOf(
        Win_singleNo
      ) != -1
    ) {
      winPoint = winPoint + Game.Card_Club_amount * 3.7; /*------------x9*/
    }

    if (
      Game.Card_Diamond_amount != 0 &&
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].indexOf(Win_singleNo) != -1
    ) {
      winPoint = winPoint + Game.Card_Diamond_amount * 3.7; /*------------x9*/
    }

    /*----------------------------------------*/

    if (
      Game.Card_Red_amount != 0 &&
      [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24, 25,
      ].indexOf(Win_singleNo) != -1
    ) {
      winPoint = winPoint + Game.Card_Red_amount * 1.9; /*------------x9*/
    }

    if (
      Game.Card_Black_amount != 0 &&
      [
        26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
        44, 45, 47, 46, 48, 49, 50, 51,
      ].indexOf(Win_singleNo) != -1
    ) {
      winPoint = winPoint + Game.Card_Black_amount * 1.9; /*------------x9*/
    }
    /*------------------------------------------------------*/

    if (Game.Card_A_6_amount != 0 && [0, 1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30, 31, 39, 40, 41, 42, 43, 44].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_A_6_amount * 1.9; /*------------x9*/
    }

    //if (Game.Card_seven_amount != 0 && Win_singleNo == 7) {
    if (Game.Card_seven_amount != 0 && [6, 19, 32, 45].indexOf(Win_singleNo) != -1) {

      winPoint = winPoint + Game.Card_seven_amount * 12; /*------------x9*/
    }

    if (Game.Card_8_K_amount != 0 && [7, 8, 9, 10, 11, 12, 20, 21, 22, 23, 24, 25, 33, 34, 35, 36, 37, 38, 46, 47, 48, 49, 50, 51].indexOf(Win_singleNo) != -1) {
      winPoint = winPoint + Game.Card_8_K_amount * 1.9; /*------------x9*/
    }
    /*---------------------------------------------------------------- */
    if (Game.Card_Andhar_amount != 0 && random_andhar_bahar == 0) {
      winPoint = winPoint + Game.Card_Andhar_amount * 1.9; /*------------x9*/
    }

    if (Game.Card_Bahar_amount != 0 && random_andhar_bahar == 1) {

      winPoint = winPoint + Game.Card_Bahar_amount * 1.9; /*------------x9*/
    }

    console.log(`OnWinNo - Player ${data.playerId}, Win_singleNo: ${Win_singleNo}, Calculated winPoint: ${winPoint}`);

    service.UpdateGameRunningDataWinpoint(data.playerId, Game.playedTime, winPoint);
    service.WinamountDetails(data.playerId, game_id, winPoint);
    AppService.dailyReport(data.playerId, Game.idManager, Game.betpoint, winPoint);
    // SuffleBots();
  }


}

 


function OnWinAmount(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnWinAmount, async (data) => {
    console.log("OnWinAmount hit", data);
    console.log(`OnWinAmount - Player ${data.playerId}, Received winpoint: ${data.winpoint}`);
    let point = await service.updateUserPoint(
      data.playerId,
      data.winpoint,
    );
    console.log(`OnWinAmount - Updated balance for player ${data.playerId}: ${point}`);
    socket.emit(events.OnWinAmount, {
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
    console.log("player got dissconnected " + socket.id);
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

  let obj = {
    // timer,
    // gameState,
    // socketId : player.socketId,
    gametimer: i,
    previous_Wins: NewpreviousWin_single,
    botsBetsDetails: BotsBetsDetails,
    // balance: player.balance,
  };

  socket.emit(events.OnCurrentTimer, obj);
}

//Game History Record=====================================================================
function gameHistoryRecord(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnHistoryRecord, async function (data) {
    let matrixRecord = await service.gameMartixRecords();
    let slotRecord = await service.gameSlotRecords();
    socket.emit(events.OnHistoryRecord, {
      matrixRecord: previousWins,
      slotRecord,
    });
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

//On OnSendWinNo =>Calcuate game Winning No when j==8 ======================================

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
      console.log(
        "player " + betData[commonVar.playerId] + ` wins amount ${winAmount}`
      );
      betData[commonVar.socket].emit(events.OnPlayerWin, { winAmount });
    } else {
      console.log(
        `player ${betData[commonVar.playerId]} lost ${betData[0] + betData[1] + betData[2]
        } `
      );
    }
  }

  //$- Add bet info to Database
  const playerWiningBalance = await service.updateWinningAmount({
    spot: winningSpot,
    room_id: timeStamp,
  });
  console.log("Player bet info:");
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
let i = timerVar.bettingNewAndarbhar;
let j = timerVar.betCalculationTimer;
let k = timerVar.waitTimer;
let isTimeUp = false;
let canPlaceBets = true;

async function ResetTimers() {
   let D = new Date();
  timeStamp = D.getTime();

  //ROUND_COUNT = ROUND_COUNT === 5 ? 0 : ++ROUND_COUNT;
  ROUND_COUNT = ROUND_COUNT + 1;
  flags1 = 0;
  i = timerVar.bettingNewAndarbhar;
  j = timerVar.betCalculationTimer;
  k = timerVar.waitTimer;

  LeftBets = [];
  MiddleBets = [];
  RightBets = [];

  ResetBotsBets();

  Sockets.to(gameRoom).emit(events.OnTimerStart, { result: i });
  console.log("OnTimerStart...");
  isTimeUp = false;
  OnTimerStart();
  // SendBotData();
}

async function OnTimerStart() {
  gameState = state.canBet;
  canPlaceBets = true;
  i--;

  //this will help to stop bots betting just before the round end
  if (i === 2) isTimeUp = true;
  if (i == 0) {
    // await sleep(timerVar.intervalDalay);
    console.log("OnTimeUp- AndharNew...");
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

  if (j === 1) {
    let playerData = await service.GetAllplayer()
    //console.log(playerData)

    if (playerData.length > 0) {

      let AndarBahar_betsResult = await service.DetailAndarBahar();

      Win_singleNo = getWinCardValue(AndarBahar_betsResult);

      let adminWin = await service.getAdminandarbahar()
      if (adminWin.value == -1) {

        let random_andhar_bahar = AndarBahar_betsResult.Card_Andhar_amount <= AndarBahar_betsResult.Card_Bahar_amount ? 0 : 1;

        pushAndShift(NewpreviousWin_single, Win_singleNo);


        let NewPreS = NewpreviousWin_single.filter((item) => item !== null);

        if (random_andhar_bahar == 0) {
          Andar_Card_List[4] = Win_singleNo;
          Bahar_Card_List[4] = getRandomElementAfterFilter(random_card_andar, Win_singleNo);

        }

        if (random_andhar_bahar == 1) {
          Bahar_Card_List[4] = Win_singleNo;
          Andar_Card_List[4] = getRandomElementAfterFilter(random_card_bahar, Win_singleNo);;

        }
      
        Sockets.to(gameRoom).emit(events.OnWinNo, {
          message: " wins",
          win_andhar_bahar: random_andhar_bahar,
          Andar_Card_List: Andar_Card_List,
          Bahar_Card_List: Bahar_Card_List,
          winNo: Win_singleNo,
          //    playerId: data.playerId,
          RoundCount: ROUND_COUNT,
          // previousWin_single: NewpreviousWin_single,
          previousWin_single: NewPreS,

        });
        
        for (let index = 0; index < playerData.length; index++) {
          await OnWinNo({ playerId: playerData[index].playerId }, Win_singleNo, random_andhar_bahar)
        }

        //SuffleBots();
      }

      else {
        Win_singleNo = adminWin.value

        /*NewpreviousWin_single.push(Win_singleNo)
       */
        let random_andhar_bahar = AndarBahar_betsResult.Card_Andhar_amount <= AndarBahar_betsResult.Card_Bahar_amount ? 1 : 0; //0to1

        let NewPreS = NewpreviousWin_single.filter((item) => item !== null)
        //console.log("Array of preno-admin:-----------", NewPreS)
        Sockets.to(gameRoom).emit(events.OnWinNo, {
          message: " wins",
          win_andhar_bahar: random_andhar_bahar,
          Andar_Card_List: Andar_Card_List,
          Bahar_Card_List: Bahar_Card_List,

          winNo: Win_singleNo,
          //playerId: data.playerId,
          RoundCount: ROUND_COUNT,
          //previousWin_single: NewpreviousWin_single,
          previousWin_single: NewPreS,

        });

      }

    }
    else {
      let Win = 0;
      let Win1 = 0;
      let winNo = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

      let l = winNo.length;
      let r = Math.floor(Math.random() * l);
      Win = Math.floor(Math.random() * 52);
      // Win=6;


      if (win_AndarBaharifnoBet != -1) {
        Win1 = win_AndarBaharifnoBet;
      } else {
        win_AndarBaharifnoBet = Math.floor(Math.random() * 2);
        Win1 = win_AndarBaharifnoBet;
      }

      //NewpreviousWin_single.pop();
      if (Andar_Card_List[Andar_Card_List.length - 1] != Win && Win1 == 0) {
        pushAndShift(Andar_Card_List, Win);
      }
      if (Bahar_Card_List[Bahar_Card_List.length - 1] != Win && Win1 == 1) {
        pushAndShift(Bahar_Card_List, Win);
      }

      if (NewpreviousWin_single[NewpreviousWin_single.length - 1] != Win) {
        pushAndShift(NewpreviousWin_single, Win);
      }


      Sockets.to(gameRoom).emit(events.OnWinNo, {

        message: " wins",
        win_andhar_bahar: win_AndarBaharifnoBet,
        Andar_Card_List: Andar_Card_List,
        Bahar_Card_List: Bahar_Card_List,
        winNo: Win,

        RoundCount: ROUND_COUNT,
        previousWin_single: NewpreviousWin_single,

      });
      //SuffleBots();

    }
    console.log('clreaing');
     service.RemoveandarbaharBetsAll();
     service.RemoveAllplayer();

    win_AndarBaharifnoBet = -1;
    win_global = -1;
    win_globalifnoBet = -1;
  }


  //OnSendWinNo();

  if (j === 0) {
    console.log('resetting');
  
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

function pushAndShift(a, n) {
  a.shift();
  a.push(n);

}



// function getWinCardValue(AndarBahar_betsResult) {
//   // Parse all bet amounts to ensure they're numbers
//   const parseBet = (amount) => parseInt(amount) || 0;
  
//   // Calculate effective bets for each individual card considering all overlapping bets
//   const cardBets = [];
//   for (let i = 0; i < 13; i++) {
//     cardBets[i] = {
//       heart: 0,
//       diamond: 0,
//       spade: 0,
//       club: 0
//     };
//   }
  
//   // Direct card bets
//   cardBets[0].heart = cardBets[0].diamond = cardBets[0].spade = cardBets[0].club = parseBet(AndarBahar_betsResult.Card_A_amount);
//   cardBets[1].heart = cardBets[1].diamond = cardBets[1].spade = cardBets[1].club = parseBet(AndarBahar_betsResult.Card_2_amount);
//   cardBets[2].heart = cardBets[2].diamond = cardBets[2].spade = cardBets[2].club = parseBet(AndarBahar_betsResult.Card_3_amount);
//   cardBets[3].heart = cardBets[3].diamond = cardBets[3].spade = cardBets[3].club = parseBet(AndarBahar_betsResult.Card_4_amount);
//   cardBets[4].heart = cardBets[4].diamond = cardBets[4].spade = cardBets[4].club = parseBet(AndarBahar_betsResult.Card_5_amount);
//   cardBets[5].heart = cardBets[5].diamond = cardBets[5].spade = cardBets[5].club = parseBet(AndarBahar_betsResult.Card_6_amount);
//   cardBets[6].heart = cardBets[6].diamond = cardBets[6].spade = cardBets[6].club = parseBet(AndarBahar_betsResult.Card_7_amount);
//   cardBets[7].heart = cardBets[7].diamond = cardBets[7].spade = cardBets[7].club = parseBet(AndarBahar_betsResult.Card_8_amount);
//   cardBets[8].heart = cardBets[8].diamond = cardBets[8].spade = cardBets[8].club = parseBet(AndarBahar_betsResult.Card_9_amount);
//   cardBets[9].heart = cardBets[9].diamond = cardBets[9].spade = cardBets[9].club = parseBet(AndarBahar_betsResult.Card_10_amount);
//   cardBets[10].heart = cardBets[10].diamond = cardBets[10].spade = cardBets[10].club = parseBet(AndarBahar_betsResult.Card_J_amount);
//   cardBets[11].heart = cardBets[11].diamond = cardBets[11].spade = cardBets[11].club = parseBet(AndarBahar_betsResult.Card_Q_amount);
//   cardBets[12].heart = cardBets[12].diamond = cardBets[12].spade = cardBets[12].club = parseBet(AndarBahar_betsResult.Card_K_amount);
  
//   // Add suit-specific bets
//   for (let i = 0; i < 13; i++) {
//     cardBets[i].heart += parseBet(AndarBahar_betsResult.Card_Heart_amount);
//     cardBets[i].diamond += parseBet(AndarBahar_betsResult.Card_Diamond_amount);
//     cardBets[i].spade += parseBet(AndarBahar_betsResult.Card_Spade_amount);
//     cardBets[i].club += parseBet(AndarBahar_betsResult.Card_Club_amount);
//   }
  
//   // Add color bets (Red affects Heart and Diamond, Black affects Spade and Club)
//   for (let i = 0; i < 13; i++) {
//     cardBets[i].heart += parseBet(AndarBahar_betsResult.Card_Red_amount);
//     cardBets[i].diamond += parseBet(AndarBahar_betsResult.Card_Red_amount);
//     cardBets[i].spade += parseBet(AndarBahar_betsResult.Card_Black_amount);
//     cardBets[i].club += parseBet(AndarBahar_betsResult.Card_Black_amount);
//   }
  
//   // Add range bets
//   // A-6 range
//   for (let i = 0; i <= 5; i++) {
//     cardBets[i].heart += parseBet(AndarBahar_betsResult.Card_A_6_amount);
//     cardBets[i].diamond += parseBet(AndarBahar_betsResult.Card_A_6_amount);
//     cardBets[i].spade += parseBet(AndarBahar_betsResult.Card_A_6_amount);
//     cardBets[i].club += parseBet(AndarBahar_betsResult.Card_A_6_amount);
//   }
  
//   // 7 only
//   cardBets[6].heart += parseBet(AndarBahar_betsResult.Card_seven_amount);
//   cardBets[6].diamond += parseBet(AndarBahar_betsResult.Card_seven_amount);
//   cardBets[6].spade += parseBet(AndarBahar_betsResult.Card_seven_amount);
//   cardBets[6].club += parseBet(AndarBahar_betsResult.Card_seven_amount);
  
//   // 8-K range
//   for (let i = 7; i <= 12; i++) {
//     cardBets[i].heart += parseBet(AndarBahar_betsResult.Card_8_K_amount);
//     cardBets[i].diamond += parseBet(AndarBahar_betsResult.Card_8_K_amount);
//     cardBets[i].spade += parseBet(AndarBahar_betsResult.Card_8_K_amount);
//     cardBets[i].club += parseBet(AndarBahar_betsResult.Card_8_K_amount);
//   }
  
//   // Find the card with minimum total bet
//   let minBet = Infinity;
//   let minBetCards = [];
  
//   for (let rank = 0; rank < 13; rank++) {
//     for (let suit of ['heart', 'diamond', 'spade', 'club']) {
//       const totalBet = cardBets[rank][suit];
//       if (totalBet < minBet) {
//         minBet = totalBet;
//         minBetCards = [{rank, suit}];
//       } else if (totalBet === minBet) {
//         minBetCards.push({rank, suit});
//       }
//     }
//   }
  
//   // Randomly select one card from those with minimum bet
//   const selectedCard = minBetCards[Math.floor(Math.random() * minBetCards.length)];
  
//   // Get the actual card value
//   const cardValue = cardMapping[selectedCard.suit][selectedCard.rank];
  
//   console.log("Selected card:", selectedCard, "with total bet:", minBet);
//   console.log("Final card value:", cardValue);
  
//   return cardValue;
// }


function getWinCardValue(AndarBahar_betsResult) {
  // Parse all bet amounts to ensure they're numbers
  const parseBet = (amount) => parseInt(amount) || 0;

  // Initialize total bets for each card (52 cards: 0-51)
  const totalBets = Array(52).fill(0);

  // Map of card values to their indices (0-51)
  const cardIndices = {
    diamond: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // 0-12
    heart: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], // 13-25
    club: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38], // 26-38
    spade: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51], // 39-51
  };

  // Direct card bets (A to K)
  const directBets = [
    parseBet(AndarBahar_betsResult.Card_A_amount),  // A
    parseBet(AndarBahar_betsResult.Card_2_amount),  // 2
    parseBet(AndarBahar_betsResult.Card_3_amount),  // 3
    parseBet(AndarBahar_betsResult.Card_4_amount),  // 4
    parseBet(AndarBahar_betsResult.Card_5_amount),  // 5
    parseBet(AndarBahar_betsResult.Card_6_amount),  // 6
    parseBet(AndarBahar_betsResult.Card_7_amount),  // 7
    parseBet(AndarBahar_betsResult.Card_8_amount),  // 8
    parseBet(AndarBahar_betsResult.Card_9_amount),  // 9
    parseBet(AndarBahar_betsResult.Card_10_amount), // 10
    parseBet(AndarBahar_betsResult.Card_J_amount),  // J
    parseBet(AndarBahar_betsResult.Card_Q_amount),  // Q
    parseBet(AndarBahar_betsResult.Card_K_amount),  // K
  ];

  // Add direct bets
  for (let rank = 0; rank < 13; rank++) {
    for (let suit in cardIndices) {
      const cardIndex = cardIndices[suit][rank];
      totalBets[cardIndex] += directBets[rank];
    }
  }

  // Add suit bets
  const suitBets = {
    heart: parseBet(AndarBahar_betsResult.Card_Heart_amount),
    diamond: parseBet(AndarBahar_betsResult.Card_Diamond_amount),
    spade: parseBet(AndarBahar_betsResult.Card_Spade_amount),
    club: parseBet(AndarBahar_betsResult.Card_Club_amount),
  };

  for (let suit in cardIndices) {
    for (let rank = 0; rank < 13; rank++) {
      const cardIndex = cardIndices[suit][rank];
      totalBets[cardIndex] += suitBets[suit];
    }
  }

  // Add color bets
  const redBet = parseBet(AndarBahar_betsResult.Card_Red_amount);
  const blackBet = parseBet(AndarBahar_betsResult.Card_Black_amount);

  // Red: Hearts and Diamonds
  for (let suit of ['heart', 'diamond']) {
    for (let rank = 0; rank < 13; rank++) {
      const cardIndex = cardIndices[suit][rank];
      totalBets[cardIndex] += redBet;
    }
  }

  // Black: Spades and Clubs
  for (let suit of ['spade', 'club']) {
    for (let rank = 0; rank < 13; rank++) {
      const cardIndex = cardIndices[suit][rank];
      totalBets[cardIndex] += blackBet;
    }
  }

  // Add range bets
  const aTo6Bet = parseBet(AndarBahar_betsResult.Card_A_6_amount);
  const sevenBet = parseBet(AndarBahar_betsResult.Card_seven_amount);
  const eightToKBet = parseBet(AndarBahar_betsResult.Card_8_K_amount);

  // A-6 (ranks 0-5)
  for (let rank = 0; rank <= 5; rank++) {
    for (let suit in cardIndices) {
      const cardIndex = cardIndices[suit][rank];
      totalBets[cardIndex] += aTo6Bet;
    }
  }

  // 7 (rank 6)
  for (let suit in cardIndices) {
    const cardIndex = cardIndices[suit][6];
    totalBets[cardIndex] += sevenBet;
  }

  // 8-K (ranks 7-12)
  for (let rank = 7; rank <= 12; rank++) {
    for (let suit in cardIndices) {
      const cardIndex = cardIndices[suit][rank];
      totalBets[cardIndex] += eightToKBet;
    }
  }

  // Find the card with the minimum total bet
  let minBet = Infinity;
  let minBetCards = [];

  for (let i = 0; i < totalBets.length; i++) {
    if (totalBets[i] < minBet) {
      minBet = totalBets[i];
      minBetCards = [i];
    } else if (totalBets[i] === minBet) {
      minBetCards.push(i);
    }
  }

  // Randomly select one card from those with minimum bet
  const selectedCardIndex = minBetCards[Math.floor(Math.random() * minBetCards.length)];

  // Map the card index back to rank and suit for logging
  let selectedRank, selectedSuit;
  for (let suit in cardIndices) {
    const ranks = cardIndices[suit];
    const rankIndex = ranks.indexOf(selectedCardIndex);
    if (rankIndex !== -1) {
      selectedRank = rankIndex;
      selectedSuit = suit;
      break;
    }
  }

  console.log("Selected card:", { rank: selectedRank, suit: selectedSuit }, "with total bet:", minBet);
  console.log("Final card value:", selectedCardIndex);

  return selectedCardIndex;
}

function getRandomElementAfterFilter(array, numberToRemove) {
  // Remove the specified number from the array
  var filteredArray = array.filter(num => num !== numberToRemove);
  
  // Generate a random index within the range of the filtered array
  var randomIndex = Math.floor(Math.random() * filteredArray.length);
  
  // Return the randomly selected element from the filtered array
  return filteredArray[randomIndex];
}
module.exports.StartNewAndarbharGame = StartNewAndarbharGame;
module.exports.GetSocket = GetSocket;

