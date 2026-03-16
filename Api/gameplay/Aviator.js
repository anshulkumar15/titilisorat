"use strict";
const debug = require("debug")("test");
const DB_debug = require("debug")("db");
const service = require("../services/AviatorGameService");
const events = require("../Constants").events;
const commonVar = require("../Constants").commonVar;
const state = require("../Constants").state;
const timerVar = require("../Constants").timerVar;
const gameId = 9;
const gameRoom = require("../Constants").selectGame[gameId];
const playerManager = require("../utils/PlayerDataManager");
const AppService = require("../services/AppService");
//json

let Sockets;
let gameState;
let altitude = 1.00;

let timeStamp; //as room id(change after 30 sec)
let ROUND_COUNT = 0; //reset to 0 after 5 round
let totalPayout = 0;
let totalBets=0;
let previousWins = ['1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '1x'];
SetInitialData();

function GetSocket(SOCKET) {
  Sockets = SOCKET;
  ResetTimers();
}

async function SetInitialData() {
  //THIS WILL RUN ONLY ONCE
  // previousWins = await service.lastWinningNo(); //db
}

function StartAviatorGame(data) {
  SendCurrentRoundInfo(data);
  OnCashOut(data);
  //OnFlightBlast(data);
  // OnFlightHeight(data);
  OnBetsPlaced(data);
  OnleaveRoom(data);
}

function OnleaveRoom(data) {
  let socket = data[commonVar.socket];
  socket.on(events.onleaveRoom, function (data) {
    try {
      // console.log('OnleaveRoom--Anar')
      socket.leave(gameRoom);
      socket.removeAllListeners(events.OnBetsPlaced);
      socket.removeAllListeners(events.OnFightHeight);
      socket.removeAllListeners(events.OnFightBlast);
      socket.removeAllListeners(events.OnCashOut);

      socket.removeAllListeners(events.OnWinNo);
      socket.removeAllListeners(events.OnTimeUp);
      socket.removeAllListeners(events.OnTimerStart);
      socket.removeAllListeners(events.OnCurrentTimer);
      socket.removeAllListeners(events.onleaveRoom);



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
  let WinX = 0.00;
  let socket = data[commonVar.socket];

  socket.on("OnBetsPlaced", async (data) => {
    // usersingleNoChoice = data.category;
    // console.log("Avi--OnBetsPlaced", data)

    let userBalance = await service.onbalance(data.playerId);
    let idManager = userBalance[0].idManager;
    let player_bet_amount = data.points;
    let playerName = data.playerId;
    // console.log(userBalance, "user")
    if (userBalance[0].point >= player_bet_amount) {

      //  // console.log("bet request", data);
      await service.AddPlayerIdInBetplaced(data.playerId);
      let isbetPlaced = true;
      let point = await service.getUserPoint(data.playerId, player_bet_amount);

      // console.log("Point", point);
      await service.AvaitorBets(
        data.points
      );

      await service.GameRunning(
        data.playerId,
        ROUND_COUNT,
        WinX, idManager, data.points, timeStamp
      );


      if (player_bet_amount == 0) {
        socket.emit(events.OnBetsPlaced, {
          status: 400,
          message: "Bet not Confirmed",
          data: {
            playerId: data.playerId,
            balance: point - player_bet_amount,
          },
        }
        );
      } else {
        socket.emit(events.OnBetsPlaced, {
          status: 200,
          message: "Bet Confirmed",
          data: {
            playerId: data.playerId,
            balance: point - player_bet_amount,
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
// function OnFlightHeight(data) {
//   let socket = data[commonVar.socket];
//   socket.on(events.OnBetsPlaced, (data) => {
//     // console.log('on OnFlightHeight');
//     socket.to(gameRoom).emit(events.OnFlightHeight, data);
//   });
// }
function OnFlightBlast(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnFlightBlast, (data) => {
    // console.log('OnFlightBlast', data)
  });
}

let total
function OnCashOut(data) {
  let socket = data[commonVar.socket];
  socket.on(events.OnCashOut, async (data) => {
    // console.log('OnCashOut', data)
    let game_id = 9;

    //calaculate total
    let totalBets = await service.getTotalBet();
    let Game = await service.getPlayerBet(data.playerId, timeStamp);
    if (!Game) {
      return;
    }
    let multiplier = (data.multiplier);


    let winpoint = multiplier * Game.betpoint;
    pushAndShift(previousWins, multiplier + 'x');

    // console.log('before-', winpoint);
    if (totalPayout < 1) {
      //blast
      k = 1;
      // console.log('before-bastbbbbbbbbbbbbbb', winpoint);
      return;
    } else {
      totalPayout -= winpoint;
      // console.log('giving pointssssss', winpoint);
      //update total_bet

      // let d = await service.redueTotalBet(winpoint);
      service.UpdateGameRunningDataWinpoint(data.playerId, Game.playedTime, winpoint, multiplier);
      service.WinamountDetails(data.playerId, game_id, winpoint);
      AppService.dailyReport(data.playerId, Game.idManager, Game.betpoint, winpoint);

    }
  });
}

function OnDissConnected(data) {
  let socket = data[commonVar.socket];
  socket.on("disconnect", (data) => {
    // console.log("player got dissconnected " + socket.id);
    playerManager.RemovePlayer(socket.id);
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



async function SendCurrentRoundInfo(data) {
  let socket = data[commonVar.socket];
  let timer = 0;
  altitude = 1.00;
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
    gametimer: i,
    previousWins,
  };

  socket.emit(events.OnCurrentTimer, obj);
}

//game timers------------------------------------------
let i = timerVar.bettingAviator;
let j = timerVar.ABHCalculationTimer;
let k = timerVar.waitTimer;
let isTimeUp = false;
let canPlaceBets = true;
let maxHeight = 1;


function ResetTimers() {
  let D = new Date();
  timeStamp = D.getTime();
  ROUND_COUNT += 1;
  i = timerVar.bettingAviator;
  j = timerVar.betCalculationTimer;
  k = timerVar.aviator_max_fighttimer;

  maxHeight = 1;
  totalPayout = 0;
  totalBets=0;
  altitude = 1.00

  Sockets.to(gameRoom).emit(events.OnTimerStart, { result: i, previousWins: previousWins });

  // console.log("betting...", i, j, k);
  isTimeUp = false;
  OnTimerStart();
}





async function OnTimerStart() {
  gameState = state.canBet;
  canPlaceBets = true;
  i--;

  //this will help to stop bots betting just before the round end

  if (i <= 0) {
    let chance = 0.5;
    await sleep(timerVar.delay);
    // console.log("timeUp Aviator sleep ...", i, j, k);
    Sockets.to(gameRoom).emit(events.OnTimeUp);

    totalBets = await service.getTotalBet();
    maxHeight = 1;
    if (totalBets.total_bet > 0) {
      totalPayout = totalBets.total_bet * 3;
      let maxMultiplier = totalPayout / totalBets.total_bet;
      if (Math.random() <= chance) {
        // Win: payout is bet times a random multiplier between 1 and maxMultiplier
        maxHeight = 1 + Math.random() * (maxMultiplier - 1);
      }

      // console.log('maxHeight', maxHeight, 'totalPayout', totalPayout, 'maxMultiplier', maxMultiplier);
      if (maxHeight <= 1.00) {
        //round ended restart the timers
        Sockets.to(gameRoom).emit(events.OnFlightBlast, { h: altitude.toFixed(2) });
        // console.log('reset Aviator');
        service.RemoveAviatorBetsAll();
        service.RemoveAllplayer();
        await sleep(3000);

        ResetTimers();
        return;
      }

    }


    fightStartTimer();
    return;
  }


  await sleep(timerVar.delay);
  OnTimerStart();
}

async function fightStartTimer() {
  gameState = state.wait;
  canPlaceBets = false;
  if (k <= 1) {
    //round ended restart the timers
    Sockets.to(gameRoom).emit(events.OnFlightBlast, { h: altitude.toFixed(2) });
    // console.log('reset Aviator Atitltude', i, j, k);
    service.RemoveAviatorBetsAll();
    service.RemoveAllplayer();
    if(totalBets > 1){
      service.saveResult(timeStamp, gameId, altitude.toFixed(2));
    }
    
    await sleep(3000);
    ResetTimers();
    return;
  }
  Sockets.to(gameRoom).emit('OnFlightHeight', { h: altitude.toFixed(2) });
  await sleep(timerVar.delay);
  altitude += 0.1;
  k--;

  fightStartTimer();
}
//game timers-----------------END-------------------------

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function pushAndShift(a, n) {
  a.shift();
  a.push(n);

}

function generateRandomNo(min, max) {
  //min & max include
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports.StartAviatorGame = StartAviatorGame;
module.exports.GetSocket = GetSocket;
