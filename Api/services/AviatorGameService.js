"use strict";
const debug = require("debug")("test");
const users = require("../models/users");
const aviator_bet = require("../models/aviator_bet");
const isbetplaced_aviator = require("../models/isbetplaced_aviator");
const game_running_avaitor = require("../models/game_running_avaitor");
const admin_aviator = require("../models/admin_aviator");
const game_result_aviator = require("../models/game_result_aviator");
const AppService = require("./AppService");
const commonVar = require("../Constants").commonVar;

const userByEmail = async (playerId) => {
  try {
    let user = await users.find({ email: playerId }).limit(1);
    return user;
  } catch (err) {
    console.log(err);
  }
};
const userById = async (playerId) => {
  try {
    let user = await users.find({ _id: playerId })
    return user;
  } catch (err) {
    console.log(err);
  }
}
const getUserPoint = async (playerId, betPoints) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]["point"];
    let savePoint = await AppService.addPointByEmail(playerId, -betPoints);
    return result;
  } catch (err) {
    console.log(err);
  }
};
const getUserBalance = async (playerId) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]['cash_balance'];
    return result;
  } catch (err) {
    console.log(err);
  }
}

const isValidArray = (arr) => {
  if (arr != null && arr != undefined && arr.length > 0) {
    return true
  } else {
    return false
  }
}


const GetAllplayer = async () => {
  try {

    let userss = await isbetplaced_aviator.find({}).lean();

    // console.log(userss);
    return userss;
  } catch (err) {
    //  console.log(err);
  }
};



const getTotalBet = async (data) => {
  try {
    let selectField = {
      _id: 0,
      total_bet: 1,

    };
    return aviator_bet.findOne({ _id: 1 }).select(selectField).lean();
  
  } catch (err) {
    //  console.log(err);
  }
};
const redueTotalBet = async (amount) => {
  try {
     
   return aviator_bet.updateOne({ _id: 1 }, { $inc: { 'total_bet': -amount } });
   } catch (err) {
    //  console.log(err);
  }
};


const getAdminAviator = async () => {
  try {
    let updateResponse = await admin_aviator.findOne({ _id: 1 }).lean();
    if (updateResponse) {
      return updateResponse;
    } else {
      return false
    }
  } catch (error) {
    // console.log("error",error)
    //  console.log(error);
  }
};



const lastWinningNo = async () => {
  try {
    let limit = 10;
    let result = new Array(limit);

    let data =await game_running_avaitor.find({WinX :{$gt:0}}).lean()
        .sort({ id: -1 })
        .limit(limit)
        .sort({ id: 1 })
        .select('WinX').lean();
    if (isValidArray(data)) {
      for (var i = 0; i < data.length; i++) {
        let WinX = data[i].WinX;
        result[limit - 1 - i] = WinX;
      }
    }
    return result;
  } catch (err) {
    //  console.log(err);
  }
};

const onbalance = async (playerId) => {
  try {

    let result = await userByEmail(playerId);
    return result;
  } catch (err) {
    //  console.log(err);
  }
};
const AddPlayerIdInBetplaced = async (playerId) => {
  try {
    await isbetplaced_aviator.updateOne({ playerId }, { playerId }, { upsert: true });
  } catch (err) {
    //  console.log(err);
  }
};

const AvaitorBets = async (betamount) => {
  try {
    console.log("i m in ");
    let responseData = await aviator_bet.find({ _id: 1 });

    if (responseData.length > 0) {
      await aviator_bet.updateOne({ _id: 1 }, { $inc: { 'total_bet': betamount } });
      // console.log(userss);
    }

  } catch (err) {
    //  console.log(err);
  }
};
const getPlayerBet = async (playername, playedTime) => {
  try {
     return game_running_avaitor.findOne({ playername: playername }).sort({ playedTime: -1 });
  } catch (err) {
    //  console.log(err);
  }
};
const GameRunning = async (
  playername,
  RoundCount,
  WinX, idManager, betpoint, playedTime
) => {
  try {
    //console.log("hello");

    let formData1 = {
      playername: playername,
      RoundCount: RoundCount,
      WinX,
      idManager: idManager,
      betpoint,
      playedTime
    };

    await game_running_avaitor.create(formData1);

    return "successfully";
  } catch (err) {
     //  console.log(err);
  }
};

const updateUserPoint = async (playerId, winPoints) => {
  try {

    let savePoint = await AppService.addPointByEmail(playerId, winPoints);
    return savePoint.point;
    //return result;
  } catch (err) {
    //  console.log(err);
  }
};
const RemoveAviatorBetsAll = async () => {
  try {
   const userss = await aviator_bet.updateOne({ _id: 1 }, { total_bet: 0}, { upsert: true });
   // console.log(userss);
 } catch (err) {
   //  console.log(err);
 }
};
const RemoveAllplayer = async () => {
  try {
    let userss = await isbetplaced_aviator.deleteMany({});
    // console.log(userss);
  } catch (err) {
    //  console.log(err);
  }
};
const UpdateGameRunningDataWinpoint = async (playername, playedTime, winpoint, Win_singleNo) => {
  try {
     if (!playername || !playedTime || !winpoint) {
      return null;
    }
    let responseData = await game_running_avaitor.updateOne({ playername, playedTime }, { winpoint: winpoint ,Win_singleNo});

    if (responseData) {
      console.log(responseData)
      return responseData
    }
    return null;
  } catch (err) {
    console.log("err", err)
    console.log(err);

  }
};
const WinamountDetails = async (playerId, game_id, point) => {
  console.log('WinamountDetails-ft')
  await AppService.WinamountDetails(playerId, game_id, point);
}
const saveResult = async (
  timeStamp,game_id,Win_singleNo
) => {
  let data = {
    room_id: timeStamp,
    game_id: 8,
    Win_singleNo: Win_singleNo
  };
  try {
    //console.log("hello");
    await game_result_aviator.create(data);
    return "successfully";
  } catch (err) {
     //  console.log(err);
  }
};
module.exports = {saveResult,WinamountDetails, UpdateGameRunningDataWinpoint,redueTotalBet, RemoveAllplayer,RemoveAviatorBetsAll, getPlayerBet, getTotalBet, updateUserPoint, GameRunning, AvaitorBets, getUserPoint, AddPlayerIdInBetplaced, lastWinningNo, onbalance, getUserBalance }