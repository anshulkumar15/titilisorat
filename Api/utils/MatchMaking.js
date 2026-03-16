"use strict";
const JoinRoom = require("./JoinRoom").JoinRoom;
const debug = require("debug")("test");
const commonVar = require("../Constants").commonVar;
const selectGame = require("../Constants").selectGame;
//const StartDVsTGame = require("../gameplay/DragonVsTiger").StartDVsTGame;
//const StartTitaliGame = require("../gameplay/TitaliGame").StartTitaliGame;
//const StartLuckyBall = require("../gameplay/LuckyBall").StartLuckyBall;
const StartRouletteGame = require("../gameplay/Roulette").StartRouletteGame;
const StartFunTargetGame = require("../gameplay/FunTarget").StartFunTargetGame;
const StartTripleChance = require("../gameplay/TripleChance").StartTripleChance;

//const StartAndarbharGame = require("../gameplay/Andarbhar").StartAndarbharGame;
const StartNewAndarbharGame =
  require("../gameplay/NewAndarbhar").StartNewAndarbharGame;

//const StartGame = require("../gameplay/Sevenup").StartGame;

const StartAviatorGame = require("../gameplay/Aviator").StartAviatorGame;


async function MatchPlayer(data) {
  let result = await JoinRoom(data);
  if (result.result === commonVar.success) {
      console.log("successfully joined the room " + result[commonVar.roomName]);
    data[commonVar.roomName] = result[commonVar.roomName];
  }

  switch (data[commonVar.roomName]) {
    case selectGame[1]:
  //    StartGame(data);
      break;
    //case selectGame[2]: StartDVsTGame(data);break;
    case selectGame[3]:
      // StartAndarbharGame(data);
      StartNewAndarbharGame(data);
      break;
    // case selectGame[4]: StartTitaliGame(data);break;
    //case selectGame[5]: StartLuckyBall(data);break;
    case selectGame[6]:
      StartTripleChance(data);
      break;
    case selectGame[7]:
      StartRouletteGame(data);
      break;
    case selectGame[8]:
      StartFunTargetGame(data);
      break;
      case selectGame[9]:
        StartAviatorGame(data);
      break;

    default:
      break;
  }
}

module.exports.MatchPlayer = MatchPlayer;
