
"use strict";
const debug = require("debug")("test");
const DB_debug = require("debug")("db");
const service = require("../services/FunTargetService");
const events = require("../Constants").events;
const commonVar = require("../Constants").commonVar;
const state = require("../Constants").state;
const spot = require("../Constants").spot;
const timerVar = require("../Constants").timerVar;
const gameId = 8;
const gameRoom = require("../Constants").selectGame[gameId];
const CardsSet = require("../Constants").setOfCards;

const admin_funtarget = require("../models/admin_funtarget");

const botManager = require("../utils/BotManager");
const playerManager = require("../utils/PlayerDataManager");

//json
const chipDataJson = require("../jsonfiles/ChipsData.json");
const RandomWinAmounts = require("../jsonfiles/wins.json");
const AppService = require("../services/AppService");

const LEFT_RIGHT_WIN_RATE = 2;
const MIDDLE_WIN_RATE = 8;


let Sockets;
let gameState;
var flags1 = 0;
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

let previousWin_single = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
let NewpreviousWin_single = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

let playerName = "";
let winX;
let MainwinX;

let winPoint = 0;
let singleNoBet = [];
let singleNoBetAmount = [];
let isbetPlaced = false
let ImageGlobalArr = [];


let Zero = 0;
let One = 0;
let Two = 0;
let Three = 0;
let Four = 0;
let Five = 0;
let Six = 0;
let Seven = 0;
let Eight = 0;
let Nine = 0;
let Ten = 0;
let Eleven = 0;


var win_global = -1;
var win_globalifnoBet = -1;


let Win_singleNo = 0;
let Win_TwoNo = 0;

let usersingleNoChoice = -1;

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

function StartFunTargetGame(data) {
  SendCurrentRoundInfo(data);
  //OnChipMove(data);
  OnBetsPlaced(data);
  OnWinAmount(data);
  //OnWinNo(data);
  //OnDissConnected(data);
  gameHistoryRecord(data);
  OnleaveRoom(data);
  OnTest(data);
}

function OnleaveRoom(data) {
  let socket = data[commonVar.socket];
  socket.on(events.onleaveRoom, function (data) {
    try {
      // // //console.log('OnleaveRoom--funtarger')
      socket.leave(gameRoom);
      socket.removeAllListeners(events.OnChipMove);
      socket.removeAllListeners(commonVar.test);
      socket.removeAllListeners(events.onleaveRoom);
      socket.removeAllListeners(events.OnBetsPlaced);
      socket.removeAllListeners(events.OnWinNo);
      socket.removeAllListeners(events.OnTimeUp);
      socket.removeAllListeners(events.OnTimerStart);
      socket.removeAllListeners(events.OnCurrentTimer);

      socket.removeAllListeners(events.OnHistoryRecord);
      playerManager.RemovePlayer(socket.id);
      socket.emit(events.onleaveRoom, {
        success: `successfully leave ${gameRoom} game.`,
      });
    } catch (err) {
      // //console.log(err);
    }
  });
}



function OnBetsPlaced(data) {
  let socket = data[commonVar.socket];
  socket.on("OnBetsPlaced", async (data) => {
    // usersingleNoChoice = data.category;
    //console.log("OnBetsPlaced-funt-------", data)

    let userBalance = await service.onbalance(data.playerId);
    let idManager = userBalance[0].idManager;
    let total_bet_amount = data.BetOnZero + data.BetOnOne + data.BetOnTwo + data.BetOnThree + data.BetOnFour + data.BetOnFive + data.BetOnSix +
      data.BetOnSeven + data.BetOnEight + data.BetOnNine + data.BetOnTen + data.BetOnEleven;
    //// //console.log(userBalance, "user")
    if (userBalance[0].point >= total_bet_amount) {
      playerName = data.playerId;

      //  // //console.log("bet request", data);
      await service.AddPlayerIdInBetplaced(data.playerId);

      Zero = data.BetOnZero;
      One = data.BetOnOne;
      Two = data.BetOnTwo;
      Three = data.BetOnThree;
      Four = data.BetOnFour;
      Five = data.BetOnFive;
      Six = data.BetOnSix;
      Seven = data.BetOnSeven;
      Eight = data.BetOnEight;
      Nine = data.BetOnNine;
      Ten = data.BetOnTen;
      Eleven = data.BetOnEleven;

      isbetPlaced = true;


      let point = await service.getUserPoint(
        data.playerId, total_bet_amount);
      //console.log("Point---", point);
      await service.FuntargetBets(
        data.BetOnZero,
        data.BetOnOne,
        data.BetOnTwo,
        data.BetOnThree,
        data.BetOnFour,
        data.BetOnFive,
        data.BetOnSix,
        data.BetOnSeven,
        data.BetOnEight,
        data.BetOnNine,
        data.BetOnTen,
        data.BetOnEleven
      );

      let Game = await service.GameRunning(
        data.playerId,
        ROUND_COUNT,
        data.BetOnZero,
        data.BetOnOne,
        data.BetOnTwo,
        data.BetOnThree,
        data.BetOnFour,
        data.BetOnFive,
        data.BetOnSix,
        data.BetOnSeven,
        data.BetOnEight,
        data.BetOnNine,
         data.BetOnTen,
        data.BetOnEleven,
        
        Win_singleNo,
         idManager, total_bet_amount, timeStamp
      );
      //  // //console.log("Game", Game);
//console.log("Emitting OnBetsPlaced with data:----------------------", point ,  total_bet_amount);
      if (total_bet_amount == 0) {
        /* && data.doubleNo.length==0 && data.triple.length==0) */ socket.emit(
        events.OnBetsPlaced,
        {
          status: 400,
          message: "Bet not Confirmed",
          data: {
            playerId: data.playerId,
            balance: point - total_bet_amount,
          },
        }
      );
      } else {
        socket.emit(events.OnBetsPlaced, {
          status: 200,
          message: "Bet Confirmed",
          data: {
            playerId: data.playerId,
            balance: point - total_bet_amount,
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




async function OnWinNo(data, Multiplier, W) {
  if (W === null || W === undefined) {
    console.error("Error: Win_singleNo is null or undefined, skipping update for player:", data.playerId);
    return;
  }

  let game_id = 8;
  let winpoint = 0;

  let isplayerexist = await service.GetPlayerIdInBetplaced(data.playerId);
  if (isplayerexist == true) {
    let Game = await service.GetGameRunningData(data.playerId);
    if (Game == "no user data exits") {
      //console.log("No game data for player:", data.playerId);
    } else {
      await service.UpdateGameRunningDataWinSingleNumber(data.playerId, Game.playedTime, W);
      switch (W) {
        case 0:
          winpoint = Game.Zero * Multiplier;
          break;
        case 1:
          winpoint = Game.One * Multiplier;
          break;
         case 2:
          winpoint = Game.Two * Multiplier;
          break;
        case 3:
          winpoint = Game.Three * Multiplier;
          break;
        case 4:
          winpoint = Game.Four * Multiplier;
          break;
        case 5:
          winpoint = Game.Five * Multiplier;
          break;
        case 6:
          winpoint = Game.Six * Multiplier;
          break;
        case 7:
          winpoint = Game.Seven * Multiplier;
          break;
        case 8:
          winpoint = Game.Eight * Multiplier;
          break;
        case 9:
          winpoint = Game.Nine * Multiplier;
          break;
        case 10:
          winpoint = Game.Ten * Multiplier; // Add case for BetOnTen
          break;
        case 11:
          winpoint = Game.Eleven * Multiplier; // Add case for BetOnEleven
          break;    
       
        default:
          console.error("Invalid Win_singleNo:", W);
          return;
      }
      await service.UpdateGameRunningDataWinpoint(data.playerId, Game.playedTime, winpoint);
      await service.WinamountDetails(data.playerId, game_id, winpoint);
      await AppService.dailyReport(data.playerId, Game.idManager, Game.betpoint, winpoint);
      SuffleBots();
    }
    //console.log(`-----------Player: ${data.playerId}, Win Number: ${W}, Win Point: ${winpoint},------------------------ Game Data:`, Game);
  }

    return { winpoint };
}

function OnWinAmount(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnWinAmount, async (data) => {
    // // //console.log("OnWinAmount hit", data);
    //  await service.updateUserPoint(data.playerId, data.win_points);
    let point = await service.updateUserPoint(
      data.playerId,
      // Game.singleNo * 2.2
      //data.point
      data.winpoint,
    );
    // //console.log("Points", point);
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
    // //console.log("player got dissconnected " + socket.id);
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
    RoundCount: ROUND_COUNT,
    gametimer: i,

    // timer,
    // gameState,
    // socketId : player.socketId,
    ImageGlobalArr: ImageGlobalArr,
    previousWins: NewpreviousWin_single,
    botsBetsDetails: BotsBetsDetails,
    balance: player.balance,
  };

  socket.emit(events.OnCurrentTimer, obj);
}

//Game History Record=====================================================================
function gameHistoryRecord(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnHistoryRecord, async function (data) {
    // //console.log('OnHistoryRecord-funt')
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
    // //console.log('OnChipMove-fun');
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

async function OnSendWinNo() {
  let result = await WinNosCalculator();
  let winNo = result.winNo;
  let winningSpot = result.spot;
  let singleNo = result.singleNo;

  let winPoint = result.win_point;

  let data = {
    room_id: timeStamp,
    game_id: 8,
    winNo1: winNo[0],
    winNo2: winNo[1],
    spot: winningSpot,
  };
  let WinningCards = createWinningCards(winNo);

  const saveWinningNo = await service.updateWinningNo(data); //db

  // //ADD WIN NO TO ARRAY
  previousWins = PushWinNo(winningSpot);
  //  //console.log(`L :${fakeLeftBets}, M : ${fakeMiddleBets}, R :${fakeRightBets}`);

  CalculateBotsWinAmount(winningSpot);
  await PlayersWinAmountCalculator(winningSpot);
  let RandomWinAmount =
    RandomWinAmounts[Math.floor(GetRandomNo(0, RandomWinAmounts.length))];
  //  //console.log("random win no:" + RandomWinAmount);
  usersingleNoChoice = [];
  if (playerName != "") {
    var result2 = await service.onbalance(playerName);
  } else {
    var result2 = [{ point: 0 }];
  }

  //var arstr =["00","0","1","2","3","4","5","6"," 7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22"," 23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"]
  Sockets.to(gameRoom).emit(events.OnWinNo, {
    RoundCount: ROUND_COUNT,
    playerId: playerName,
    // winx: winX + "x",
    winx: winXarray[numb] + "x",
     winX:"1X",

    imagenumber: imagenumber,

    winNo: singleNo,
    previousWin_single: previousWin_single,
    winPoint: winPoint,
    balance: result2[0].point
  });
   //console.log('winX-------',winX, '------ROUND_COUNT------',ROUND_COUNT)
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

  if (totalLeftBets === totalMiddleBets && totalMiddleBets === totalRightBets) {
    leastBetSpot = Math.floor(Math.random() * 2); //caculate random no form 2 to 12
    winNo = generateSpotWinningNo(leastBetSpot);
    leastBetSpot = Math.floor(Math.random() * 2); // for winning spot 2 to 12
  } else {
    let leastBet = Math.min.apply(Math, bets); //minimum amount bet
    leastBetSpot = bets.indexOf(leastBet); //minimum  bet amount spot
    winNo = generateSpotWinningNo(leastBetSpot);
    leastBetSpot = Math.floor(Math.random() * 2); // for winning spot 2 to 12
  }
  if (isbetPlaced == false) {

    Win_singleNo = Math.floor(Math.random() * 10); ///Dice 1

    // Win_TwoNo = Math.floor(Math.random() * 6) + 1; ////Dice 2
  }
  let winXRandom = Math.floor(Math.random() * 2);

  // numb = Math.floor(Math.random() * 11);
  // if (winXRandom == 0) {
    winX = 1;
  // } else if (winXRandom == 1) {
  //   winX = 2;
  // } 
   /* else {

  winX = 4;
} */
  if (winXarray[numb] == 1) {
    // winX = 1;
    let imgrandom = Math.floor(Math.random() * 4);
    imagenumber = imgrandom
  } else {
    //winX = 2;
    // imagenumber = 4
  }
  isbetPlaced = false

  previousWin_single.push(Win_singleNo);

  //previousWin_single.push(Win_TwoNo);

  winPoint = 0;
  /* --------------------CartegoriesTypes Bets---------------------------*/
  if (singleNoBet.indexOf(Win_singleNo) != -1) {
    winPoint =
      winPoint +
      singleNoBetAmount[singleNoBet.indexOf(Win_singleNo)] * 9 * winX; //kitn lgn hai******** 2 to 6 ke liye
  }
  singleNoBet = [];
  singleNoBetAmount = [];

  /* if (usersingleNoChoice == 1 && Win_singleNo + Win_TwoNo == 7) {
    winPoint = winPoint + singleNoBet * 5.5; //kitn lgn hai********  7 ke
  }
  if (
    usersingleNoChoice == 2 &&
    [8, 9, 10, 11, 12].indexOf(Win_singleNo + Win_TwoNo) != -1
  ) {
    winPoint = winPoint + singleNoBet * 2.2; //kitn lgn hai**** 8to 12 ke
  }
 */
  //    win_ = Math.floor(Math.random() * 6) + 1
  if (playerName != "") {
    await service.addwinningpoint(playerName, winPoint);
  } //db

  return {
    win_point: winPoint,
    singleNo: Win_singleNo,
    winNo: winNo,
    spot: leastBetSpot,
  };
}



function generateSpotWinningNo(leastBetSpot) {
  let win1;
  let win2;
  switch (leastBetSpot) {
    case spot.left:
      win1 = Math.floor(GetRandomNo(2, 37));
      win2 = Math.floor(GetRandomNo(1, win1));
      break;
    case spot.middle:
      win1 = Math.floor(GetRandomNo(1, 37));
      win2 = win1;
      break;
    case spot.right:
      win2 = Math.floor(GetRandomNo(2, 37));
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
      // //console.log(
      //   "player " + betData[commonVar.playerId] + ` wins amount ${winAmount}`
      // );
      betData[commonVar.socket].emit(events.OnPlayerWin, { winAmount });
    } else {
      // //console.log(
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
  // //console.log("Player bet info:");
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
  //  //console.log(BotsBetsDetails);
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
let i = timerVar.bettingFunTarget;
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
  i = timerVar.bettingFunTarget;
  j = timerVar.betCalculationTimer;
  k = timerVar.waitTimer;

  LeftBets = [];
  MiddleBets = [];
  RightBets = [];

  ResetBotsBets();

  Sockets.to(gameRoom).emit(events.OnTimerStart, { result: i });
  // //console.log("betting...");
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


    //await sleep(timerVar.intervalDalay);
    // //console.log("timeUp...Fun-target");
    Sockets.to(gameRoom).emit(events.OnTimeUp);

    isTimeUp = true;
    OnTimeUp();

    return;
  }
  await sleep(timerVar.delay);
  OnTimerStart();
  //SendBotData();
}


// async function OnTimeUp() {
//   canPlaceBets = false;
//   gameState = state.cannotBet;

//   j--;

//   if (j === 1) {
//     //console.log("isbetPlaced before win calculation:", isbetPlaced);
//     var winconatinzero = [];
//     var playerData = await service.GetAllplayer();
//     //console.log("Player data:", playerData);

//     // Determine winX based on ROUND_COUNT (every 3 minutes = 3 rounds)
//     winX = ROUND_COUNT % 300 === 0 ? "2X" : "1X"; // 2X every 5 hours (300 rounds)
//     var Multiplier = winX === "2X" ? 18 : 10; // Set Multiplier based on winX
//     var imagenumber = winX === "2X" ? 4 : Math.floor(Math.random() * 4); // Set imagenumber

//     if (playerData.length > 0) {
//       var Funtarget_betsResult = await service.Detailfuntarget();
//       //console.log("Funtarget_betsResult:", Funtarget_betsResult);

//       var objectValue = Object.values(Funtarget_betsResult); // [BetOnZero, BetOnOne, ..., BetOnEleven]
//       var minimumValue = Math.min(...objectValue);
//       var minimumIndex = objectValue.indexOf(minimumValue);
//       Win_singleNo = minimumIndex; // Direct mapping: index 0 -> 0, index 1 -> 1, ..., index 11 -> 11
//       //console.log("Minimum bet value:", minimumValue, "at index:", minimumIndex, "Win_singleNo:", Win_singleNo);

//       // Collect all numbers with the minimum bet
//       if (Funtarget_betsResult.BetOnZero === minimumValue) winconatinzero.push(0);
//       if (Funtarget_betsResult.BetOnOne === minimumValue) winconatinzero.push(1);
//       if (Funtarget_betsResult.BetOnTwo === minimumValue) winconatinzero.push(2);
//       if (Funtarget_betsResult.BetOnThree === minimumValue) winconatinzero.push(3);
//       if (Funtarget_betsResult.BetOnFour === minimumValue) winconatinzero.push(4);
//       if (Funtarget_betsResult.BetOnFive === minimumValue) winconatinzero.push(5);
//       if (Funtarget_betsResult.BetOnSix === minimumValue) winconatinzero.push(6);
//       if (Funtarget_betsResult.BetOnSeven === minimumValue) winconatinzero.push(7);
//       if (Funtarget_betsResult.BetOnEight === minimumValue) winconatinzero.push(8);
//       if (Funtarget_betsResult.BetOnNine === minimumValue) winconatinzero.push(9);
//       if (Funtarget_betsResult.BetOnTen === minimumValue) winconatinzero.push(10);
//       if (Funtarget_betsResult.BetOnEleven === minimumValue) winconatinzero.push(11);

      

//       var adminWin = await service.getAdminfuntarget();
//       console.log("Admin win value: controller------", adminWin);


//       if (adminWin.selectedOption === "min_bet_win" || adminWin.value === null) {
//           // Automatic result
//           if (winconatinzero.length > 0) {
//             var l = winconatinzero.length;
//             var r = Math.floor(Math.random() * l);
//             Win_singleNo = winconatinzero[r];
//             //console.log("Randomly selected Win_singleNo from minimum bets:", Win_singleNo);
//           } else {
//             // Fallback if no minimum bets are found
//             Win_singleNo = Math.floor(Math.random() * 12); // Random number from 0 to 11
//             //console.log("No minimum bets, random Win_singleNo:", Win_singleNo);
//           }
//           NewpreviousWin_single.push(Win_singleNo);
//           for (var index = 0; index < playerData.length; index++) {
//             await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//           }

//           ImageGlobalArr.push(imagenumber);
//           Sockets.to(gameRoom).emit(events.OnWinNo, {
//             message: Win_singleNo + " wins",
//             winX: winX,
//             winNo: Win_singleNo,
//             RoundCount: ROUND_COUNT,
//             imagenumber: imagenumber,
//             previousWin_single: NewpreviousWin_single,
//           });
//           //console.log("Emitted OnWinNo - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win_singleNo);
//         } 


//         else if (adminWin.selectedOption === "max_bet_win") {

//         }

//          else if (adminWin.selectedOption === "random_win") {
//             Win_singleNo = Math.floor(Math.random() * 12); // Random number from 0 to 11

//             NewpreviousWin_single.push(Win_singleNo);
//           for (var index = 0; index < playerData.length; index++) {
//             await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//           }

//           ImageGlobalArr.push(imagenumber);
//           Sockets.to(gameRoom).emit(events.OnWinNo, {
//             message: Win_singleNo + " wins",
//             winX: winX,
//             winNo: Win_singleNo,
//             RoundCount: ROUND_COUNT,
//             imagenumber: imagenumber,
//             previousWin_single: NewpreviousWin_single,
//           });


//         }
        
//         else {
//           // Manual settings admin
//           Win_singleNo = adminWin.selectedOption;
//           //console.log("Manual Win_singleNo set by admin:", Win_singleNo);
//           for (var index = 0; index < playerData.length; index++) {
//             await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//           }

//           ImageGlobalArr.push(imagenumber);
//           Sockets.to(gameRoom).emit(events.OnWinNo, {
//             message: Win_singleNo + " wins",
//             winX: winX,
//             winNo: Win_singleNo,
//             RoundCount: ROUND_COUNT,
//             imagenumber: imagenumber,
//             previousWin_single: NewpreviousWin_single,
//           });
//           //console.log("Emitted OnWinNo (manual) - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win_singleNo);
//         }


      
     

//     } else {
//       var Win = 0;
//       var winNo = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
//       var messagearray = [
//         "Zero",
//         "One",
//         "Two",
//         "Three",
//         "Four",
//         "Five",
//         "Six",
//         "Seven",
//         "Eight",
//         "Nine",
//         "Ten",
//         "Eleven"
//       ];

//       var l = winNo.length;
//       var r = Math.floor(Math.random() * l);
//       Win = winNo[r];
//       //console.log("No players, random Win_singleNo:", Win);

//       if (NewpreviousWin_single[NewpreviousWin_single.length - 1] !== Win) {
//         NewpreviousWin_single.push(Win);
//       }

//       Sockets.to(gameRoom).emit(events.OnWinNo, {
//         message: messagearray[Win] + " wins",
//         winX: winX,
//         imagenumber: imagenumber,
//         winNo: Win,
//         RoundCount: ROUND_COUNT,
//         previousWin_single: NewpreviousWin_single,
//       });
//       //console.log("Emitted OnWinNo (no players) - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win);
//       SuffleBots();
//     }

//     await service.RemovefunBetsAll();
//     await service.RemoveAllplayer();

//     win_global = -1;
//     win_globalifnoBet = -1;
//   }

//   if (j === 0) {
//     ResetTimers();
//     return;
//   }
//   await sleep(timerVar.delay);
//   OnTimeUp();
// }


async function OnTimeUp() {
  canPlaceBets = false;
  gameState = state.cannotBet;
  j--;

  if (j === 1) {
    var winconatinzero = [];
    var playerData = await service.GetAllplayer();

    // winX = ROUND_COUNT % 300 === 0 ? "2X" : "1X";
    // var Multiplier = winX === "2X" ? 18 : 10;
    // var imagenumber = winX === "2X" ? 4 : Math.floor(Math.random() * 4);

    var Multiplier = 10;
    var imagenumber = Math.floor(Math.random() * 4);


    if (playerData.length > 0) {
      var Funtarget_betsResult = await service.Detailfuntarget();
      var objectValue = Object.values(Funtarget_betsResult);

      // ✅ Log total bets placed
      let totalBets = objectValue.reduce((sum, val) => sum + val, 0);
      console.log("💰 Total Bets This Round:", totalBets);

      var minimumValue = Math.min(...objectValue);
      var maximumValue = Math.max(...objectValue);
      var minimumIndex = objectValue.indexOf(minimumValue);
      var maximumIndex = objectValue.indexOf(maximumValue);
      Win_singleNo = minimumIndex;

      // Prepare arrays of indexes
      if (Funtarget_betsResult.BetOnZero === minimumValue) winconatinzero.push(0);
      if (Funtarget_betsResult.BetOnOne === minimumValue) winconatinzero.push(1);
      if (Funtarget_betsResult.BetOnTwo === minimumValue) winconatinzero.push(2);
      if (Funtarget_betsResult.BetOnThree === minimumValue) winconatinzero.push(3);
      if (Funtarget_betsResult.BetOnFour === minimumValue) winconatinzero.push(4);
      if (Funtarget_betsResult.BetOnFive === minimumValue) winconatinzero.push(5);
      if (Funtarget_betsResult.BetOnSix === minimumValue) winconatinzero.push(6);
      if (Funtarget_betsResult.BetOnSeven === minimumValue) winconatinzero.push(7);
      if (Funtarget_betsResult.BetOnEight === minimumValue) winconatinzero.push(8);
      if (Funtarget_betsResult.BetOnNine === minimumValue) winconatinzero.push(9);
      if (Funtarget_betsResult.BetOnTen === minimumValue) winconatinzero.push(10);
      if (Funtarget_betsResult.BetOnEleven === minimumValue) winconatinzero.push(11);

      var maxBetNumbers = [];
      if (Funtarget_betsResult.BetOnZero === maximumValue) maxBetNumbers.push(0);
      if (Funtarget_betsResult.BetOnOne === maximumValue) maxBetNumbers.push(1);
      if (Funtarget_betsResult.BetOnTwo === maximumValue) maxBetNumbers.push(2);
      if (Funtarget_betsResult.BetOnThree === maximumValue) maxBetNumbers.push(3);
      if (Funtarget_betsResult.BetOnFour === maximumValue) maxBetNumbers.push(4);
      if (Funtarget_betsResult.BetOnFive === maximumValue) maxBetNumbers.push(5);
      if (Funtarget_betsResult.BetOnSix === maximumValue) maxBetNumbers.push(6);
      if (Funtarget_betsResult.BetOnSeven === maximumValue) maxBetNumbers.push(7);
      if (Funtarget_betsResult.BetOnEight === maximumValue) maxBetNumbers.push(8);
      if (Funtarget_betsResult.BetOnNine === maximumValue) maxBetNumbers.push(9);
      if (Funtarget_betsResult.BetOnTen === maximumValue) maxBetNumbers.push(10);
      if (Funtarget_betsResult.BetOnEleven === maximumValue) maxBetNumbers.push(11);

      var adminWin = await service.getAdminfuntarget();
      console.log("Admin win setting:", adminWin);

      // ✅ Handle Target Amount logic
      if (adminWin.winType === "Target Amount") {
        const today = new Date();
        const start = new Date(adminWin.startDate);
        const end = new Date(adminWin.endDate);
        end.setHours(23, 59, 59, 999); // Full day

        const profit = adminWin.adminProfit || 0;
        const target = adminWin.targetAmount || 0;

        if (profit >= target && today >= start && today <= end) {
          console.log("🎯 Target amount reached — switching to random win mode");

          await admin_funtarget.updateOne(
            { _id: 1 },
            {
              $set: {
                winType: "Random Win",
                selectedOption: "random_win",
                adminProfit: 0,
              },
            }
          );

          // Reflect the updated state locally
          adminWin.selectedOption = "random_win";
        } else {
          adminWin.selectedOption = "min_bet_win"; // Use min bet until target is hit
        }
      }

      // ✅ Decide Win Number
      if (adminWin.selectedOption === "min_bet_win" || adminWin.value === null) {
        if (winconatinzero.length > 0) {
          var r = Math.floor(Math.random() * winconatinzero.length);
          Win_singleNo = winconatinzero[r];
        } else {
          Win_singleNo = Math.floor(Math.random() * 12);
        }
      } else if (adminWin.selectedOption === "max_bet_win") {
        if (maxBetNumbers.length > 0) {
          var r = Math.floor(Math.random() * maxBetNumbers.length);
          Win_singleNo = maxBetNumbers[r];
        } else {
          Win_singleNo = Math.floor(Math.random() * 12);
        }
      } else if (adminWin.selectedOption === "random_win") {
        Win_singleNo = Math.floor(Math.random() * 12);
      } else {
        Win_singleNo = adminWin.selectedOption;
      }

      NewpreviousWin_single.push(Win_singleNo);

      let totalWinnings = 0;

      for (let index = 0; index < playerData.length; index++) {
        const result = await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
        if (result && result.winpoint > 0) {
          totalWinnings += result.winpoint;
        }
      }

      // ✅ Log stats
      console.log("👥 Total Players Processed:", playerData.length);
      console.log("🏆 Total Winnings Distributed:", totalWinnings);
      console.log("💼 Admin Profit This Round:", totalBets - totalWinnings);

      // ✅ Update adminProfit in DB
      await admin_funtarget.updateOne(
        { _id: 1 },
        { $inc: { adminProfit: totalBets - totalWinnings } },
        { upsert: true }
      );

      ImageGlobalArr.push(imagenumber);
      Sockets.to(gameRoom).emit(events.OnWinNo, {
        message: Win_singleNo + " wins",
        winX: winX,
        winNo: Win_singleNo,
        RoundCount: ROUND_COUNT,
        imagenumber: imagenumber,
        previousWin_single: NewpreviousWin_single,
      });
    } else {
      // No players: random win
      var winNo = Math.floor(Math.random() * 12);
      var messagearray = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven"];

      if (NewpreviousWin_single[NewpreviousWin_single.length - 1] !== winNo) {
        NewpreviousWin_single.push(winNo);
      }

      console.log("📭 No players this round. Random Win:", winNo);

      Sockets.to(gameRoom).emit(events.OnWinNo, {
        message: messagearray[winNo] + " wins",
        winX: winX,
        imagenumber: imagenumber,
        winNo: winNo,
        RoundCount: ROUND_COUNT,
        previousWin_single: NewpreviousWin_single,
      });

      SuffleBots();
    }

    await service.RemovefunBetsAll();
    await service.RemoveAllplayer();

    win_global = -1;
    win_globalifnoBet = -1;
  }

  if (j === 0) {
    ResetTimers();
    return;
  }

  await sleep(timerVar.delay);
  OnTimeUp();
}




// async function OnTimeUp() {
//   canPlaceBets = false;
//   gameState = state.cannotBet;

//   j--;

//   if (j === 1) {
//     //console.log("isbetPlaced before win calculation:", isbetPlaced);
//     var winconatinzero = [];
//     var playerData = await service.GetAllplayer();
//     //console.log("Player data:", playerData);

//     // Determine winX based on ROUND_COUNT (every 3 minutes = 3 rounds)
//     winX = ROUND_COUNT % 300 === 0 ? "2X" : "1X"; // 2X every 5 hours (300 rounds)
//     var Multiplier = winX === "2X" ? 18 : 10; // Set Multiplier based on winX
//     var imagenumber = winX === "2X" ? 4 : Math.floor(Math.random() * 4); // Set imagenumber

//     if (playerData.length > 0) {
//       var Funtarget_betsResult = await service.Detailfuntarget();
//       //console.log("Funtarget_betsResult:", Funtarget_betsResult);

//       var objectValue = Object.values(Funtarget_betsResult); // [BetOnZero, BetOnOne, ..., BetOnEleven]
//       var minimumValue = Math.min(...objectValue);
//       var maximumValue = Math.max(...objectValue); // Get the maximum bet value
//       var minimumIndex = objectValue.indexOf(minimumValue);
//       var maximumIndex = objectValue.indexOf(maximumValue); // Get the index of the maximum bet
//       Win_singleNo = minimumIndex; // Default to minimum index (will be overridden if needed)
//       //console.log("Minimum bet value:", minimumValue, "at index:", minimumIndex, "Maximum bet value:", maximumValue, "at index:", maximumIndex);

//       // Collect all numbers with the minimum bet (for min_bet_win)
//       if (Funtarget_betsResult.BetOnZero === minimumValue) winconatinzero.push(0);
//       if (Funtarget_betsResult.BetOnOne === minimumValue) winconatinzero.push(1);
//       if (Funtarget_betsResult.BetOnTwo === minimumValue) winconatinzero.push(2);
//       if (Funtarget_betsResult.BetOnThree === minimumValue) winconatinzero.push(3);
//       if (Funtarget_betsResult.BetOnFour === minimumValue) winconatinzero.push(4);
//       if (Funtarget_betsResult.BetOnFive === minimumValue) winconatinzero.push(5);
//       if (Funtarget_betsResult.BetOnSix === minimumValue) winconatinzero.push(6);
//       if (Funtarget_betsResult.BetOnSeven === minimumValue) winconatinzero.push(7);
//       if (Funtarget_betsResult.BetOnEight === minimumValue) winconatinzero.push(8);
//       if (Funtarget_betsResult.BetOnNine === minimumValue) winconatinzero.push(9);
//       if (Funtarget_betsResult.BetOnTen === minimumValue) winconatinzero.push(10);
//       if (Funtarget_betsResult.BetOnEleven === minimumValue) winconatinzero.push(11);

//       // Collect all numbers with the maximum bet (for max_bet_win)
//       var maxBetNumbers = [];
//       if (Funtarget_betsResult.BetOnZero === maximumValue) maxBetNumbers.push(0);
//       if (Funtarget_betsResult.BetOnOne === maximumValue) maxBetNumbers.push(1);
//       if (Funtarget_betsResult.BetOnTwo === maximumValue) maxBetNumbers.push(2);
//       if (Funtarget_betsResult.BetOnThree === maximumValue) maxBetNumbers.push(3);
//       if (Funtarget_betsResult.BetOnFour === maximumValue) maxBetNumbers.push(4);
//       if (Funtarget_betsResult.BetOnFive === maximumValue) maxBetNumbers.push(5);
//       if (Funtarget_betsResult.BetOnSix === maximumValue) maxBetNumbers.push(6);
//       if (Funtarget_betsResult.BetOnSeven === maximumValue) maxBetNumbers.push(7);
//       if (Funtarget_betsResult.BetOnEight === maximumValue) maxBetNumbers.push(8);
//       if (Funtarget_betsResult.BetOnNine === maximumValue) maxBetNumbers.push(9);
//       if (Funtarget_betsResult.BetOnTen === maximumValue) maxBetNumbers.push(10);
//       if (Funtarget_betsResult.BetOnEleven === maximumValue) maxBetNumbers.push(11);

//       var adminWin = await service.getAdminfuntarget();
//       console.log("Admin win value: controller------", adminWin);

//       if (adminWin.selectedOption === "min_bet_win" || adminWin.value === null) {
//         // Automatic result (minimum bet wins)
//         if (winconatinzero.length > 0) {
//           var l = winconatinzero.length;
//           var r = Math.floor(Math.random() * l);
//           Win_singleNo = winconatinzero[r];
//           //console.log("Randomly selected Win_singleNo from minimum bets:", Win_singleNo);
//         } else {
//           // Fallback if no minimum bets are found
//           Win_singleNo = Math.floor(Math.random() * 12); // Random number from 0 to 11
//           //console.log("No minimum bets, random Win_singleNo:", Win_singleNo);
//         }
//         NewpreviousWin_single.push(Win_singleNo);
//         for (var index = 0; index < playerData.length; index++) {
//           await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//         }

//         ImageGlobalArr.push(imagenumber);
//         Sockets.to(gameRoom).emit(events.OnWinNo, {
//           message: Win_singleNo + " wins",
//           winX: winX,
//           winNo: Win_singleNo,
//           RoundCount: ROUND_COUNT,
//           imagenumber: imagenumber,
//           previousWin_single: NewpreviousWin_single,
//         });
//         //console.log("Emitted OnWinNo - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win_singleNo);
//       } else if (adminWin.selectedOption === "max_bet_win") {
//         // Maximum bet wins
//         if (maxBetNumbers.length > 0) {
//           var l = maxBetNumbers.length;
//           var r = Math.floor(Math.random() * l);
//           Win_singleNo = maxBetNumbers[r];
//           //console.log("Randomly selected Win_singleNo from maximum bets:", Win_singleNo);
//         } else {
//           // Fallback if no maximum bets are found
//           Win_singleNo = Math.floor(Math.random() * 12); // Random number from 0 to 11
//           //console.log("No maximum bets, random Win_singleNo:", Win_singleNo);
//         }
//         NewpreviousWin_single.push(Win_singleNo);
//         for (var index = 0; index < playerData.length; index++) {
//           await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//         }

//         ImageGlobalArr.push(imagenumber);
//         Sockets.to(gameRoom).emit(events.OnWinNo, {
//           message: Win_singleNo + " wins",
//           winX: winX,
//           winNo: Win_singleNo,
//           RoundCount: ROUND_COUNT,
//           imagenumber: imagenumber,
//           previousWin_single: NewpreviousWin_single,
//         });
//         //console.log("Emitted OnWinNo (max_bet_win) - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win_singleNo);
//       } else if (adminWin.selectedOption === "random_win") {
//         // Random win
//         Win_singleNo = Math.floor(Math.random() * 12); // Random number from 0 to 11
//         NewpreviousWin_single.push(Win_singleNo);
//         for (var index = 0; index < playerData.length; index++) {
//           await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//         }

//         ImageGlobalArr.push(imagenumber);
//         Sockets.to(gameRoom).emit(events.OnWinNo, {
//           message: Win_singleNo + " wins",
//           winX: winX,
//           winNo: Win_singleNo,
//           RoundCount: ROUND_COUNT,
//           imagenumber: imagenumber,
//           previousWin_single: NewpreviousWin_single,
//         });
//         //console.log("Emitted OnWinNo (random_win) - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win_singleNo);
//       } else {
//         // Manual settings admin
//         Win_singleNo = adminWin.selectedOption;
//         //console.log("Manual Win_singleNo set by admin:", Win_singleNo);
//         for (var index = 0; index < playerData.length; index++) {
//           await OnWinNo({ playerId: playerData[index].playerId }, Multiplier, Win_singleNo);
//         }

//         ImageGlobalArr.push(imagenumber);
//         Sockets.to(gameRoom).emit(events.OnWinNo, {
//           message: Win_singleNo + " wins",
//           winX: winX,
//           winNo: Win_singleNo,
//           RoundCount: ROUND_COUNT,
//           imagenumber: imagenumber,
//           previousWin_single: NewpreviousWin_single,
//         });
//         //console.log("Emitted OnWinNo (manual) - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win_singleNo);
//       }
//     } else {
//       var Win = 0;
//       var winNo = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
//       var messagearray = [
//         "Zero",
//         "One",
//         "Two",
//         "Three",
//         "Four",
//         "Five",
//         "Six",
//         "Seven",
//         "Eight",
//         "Nine",
//         "Ten",
//         "Eleven"
//       ];

//       var l = winNo.length;
//       var r = Math.floor(Math.random() * l);
//       Win = winNo[r];
//       //console.log("No players, random Win_singleNo:", Win);

//       if (NewpreviousWin_single[NewpreviousWin_single.length - 1] !== Win) {
//         NewpreviousWin_single.push(Win);
//       }

//       Sockets.to(gameRoom).emit(events.OnWinNo, {
//         message: messagearray[Win] + " wins",
//         winX: winX,
//         imagenumber: imagenumber,
//         winNo: Win,
//         RoundCount: ROUND_COUNT,
//         previousWin_single: NewpreviousWin_single,
//       });
//       //console.log("Emitted OnWinNo (no players) - winX:", winX, "ROUND_COUNT:", ROUND_COUNT, "Win_singleNo:", Win);
//       SuffleBots();
//     }

//     await service.RemovefunBetsAll();
//     await service.RemoveAllplayer();

//     win_global = -1;
//     win_globalifnoBet = -1;
//   }

//   if (j === 0) {
//     ResetTimers();
//     return;
//   }
//   await sleep(timerVar.delay);
//   OnTimeUp();
// }


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
    // console.table(BetHolder);
    // console.table(currentRoundData);
  });
}

module.exports.StartFunTargetGame = StartFunTargetGame;
module.exports.GetSocket = GetSocket;
