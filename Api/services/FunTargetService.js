"use strict";
const debug = require("debug")("test");
// const db = require("../config/db.js");
const users = require("../models/users");
const join_game = require("../models/join_game");
const AppService = require("./AppService");

const game_record_funtarget = require("../models/game_record_funtarget");
const funtarget_bet = require("../models/funtarget_bet");
const game_runningfuntarget = require("../models/game_runningfuntarget");
const isbetplacedfun = require("../models/isbetplacedfun");
const funtarget_playerdetail = require("../models/funtarget_playerdetail");
const admin_funtarget = require("../models/admin_funtarget");



const commonVar = require("../Constants").commonVar;

const userById = async (playerId) => {
  try {
    let sql = `SELECT * FROM users WHERE id= ? limit ?`;
    let user = await db.query(sql, [playerId, 1]);
    return user;
  } catch (err) {
    //sconsole.log(err);
  }
};


const userByEmail = async (playerId) => {
  try {
    
    let user = await users.find({ email: playerId }).limit(1);
    return user;
  } catch (err) {
    //sconsole.log(err);
  }
};
const getUserBalance = async (playerId) => {
  try {
    
    let user = await users.find({ email: playerId });
    let result = user[0]['cash_balance'];
    return result;
  } catch (err) {
    //sconsole.log(err);
  }
}
const getUserPoint = async (playerId, betPoints) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]["point"];
   
    let savePoint = await AppService.addPointByEmail(playerId, -betPoints);

    return result;
  } catch (err) {
    //sconsole.log(err);
  }
};

const updateUserPoint = async (playerId, winPoints) => {

  try {
    
    let savePoint = await AppService.addPointByEmail(playerId, winPoints);
    let result1 = savePoint["point"];
    ////sconsole.log("updateUserPoint", savePoint);
    return result1;
  } catch (err) {
    //sconsole.log(err);
  }
};

const isValidArray = (arr) => {
  if (arr != null && arr != undefined && arr.length > 0) {
    return true;
  } else {
    return false;
  }
};

const getRoundCount = async () => {
  try {
    let limit = 1;
    

    let result = game_record_funtarget.find({}).sort({ _id: -1 }).limit(1);
    let roundCount = result[result.length - 1]["room_id"] + 1;
    return roundCount;
  } catch (err) {
    //sconsole.log(err);
  }
};

const JoinGame = async (data, room_id) => {
  try {
    let user = await users.findById(data.playerId);
    if (isValidArray(user)) {
      let cash_balance = user[0]["cash_balance"];
      let chip_amt = data.chip;
      if (cash_balance >= chip_amt) {
        let parms = {
          user_id: data.playerId,
          game_id: data.gameId,
          amount: data.chip,
          spot: data.spot,
          room_id: room_id,
        };
       
        let saveBet = await join_game.create(parms);
        if (
          saveBet != null &&
          saveBet != undefined &&
          Object.keys(saveBet).length != 0
        ) {
          cash_balance -= chip_amt;
        
          let saveBalance = await users.updateOne({ id: data.playerId }, { cash_balance: cash_balance })
        }
      }
    }
    ////sconsole.log("player bet successfully add to db");
    return true;
  } catch (err) {
    //sconsole.log(err);
  }
};

const lastWinningNo = async () => {
  try {
    let limit = 20;
    let result = new Array(limit);
    
    let data =
      await game_record_funtarget.find({})
        .sort({ id: -1 })
        .limit(limit)
        .sort({ id: 1 })
        .select('spot').lean();
    if (isValidArray(data)) {
      for (var i = 0; i < data.length; i++) {
        let spot = data[i].spot;
        result[limit - 1 - i] = spot;
      }
    }
    return result;
  } catch (err) {
    //sconsole.log(err);
  }
};

const updateWinningNo = async (data) => {
  try {
    let parms = data;
   
    await game_record_funtarget.create(parms);

    ////sconsole.log("Winning no. inserted successfuly to db");
    return true;
  } catch (err) {
    //sconsole.log(err);
  }
};

const updateWinningAmount = async (data) => {
  try {
    let winningspot = data["spot"];
    let rate = winningspot === 0 || winningspot === 2 ? 2 : 8; //winning amt multile
    let game_id = 8;
    let room_id = data["room_id"];
    let playeWinningArray = [];

    let sql = `SELECT user_id FROM join_game WHERE game_id= ? AND room_id= ? AND is_updated= ? GROUP BY user_id `;
    ////db.query(sql, [game_id, room_id, 0]);
    let conditions = { 'game_id': game_id, 'room_id': room_id, 'is_updated': 0 };
    let players = await join_game.find(conditions).distinct('user_id');


    if (isValidArray(players)) {
      for (let player of players) {
        let playerId = player["user_id"];
       
        let bets = await join_game.find({ game_id, room_id, user_id: playerId }, { spot: 1, amount: 1 })
        if (isValidArray(bets)) {
          let total_win_amount = 0;
          let total_bet_amount = 0;

          for (let bet of bets) {
            let win_amount = 0;
            let playingSpot = parseInt(bet["spot"]);
            let betAmt = parseInt(bet["amount"]);
            total_bet_amount += betAmt;

            if (playingSpot === winningspot) {
              win_amount = betAmt * (rate - commonVar.adminCommisionRate);
              total_win_amount += win_amount;
            }

         
            let update_sql = await join_game.updateMany({ game_id, room_id, user_id: playerId }, { win_amount, is_updated: 1 })

            if (update_sql != null && win_amount > 0) {
              // sql = `UPDATE users SET  cash_balance= cash_balance + ?   WHERE id= ?  `;
              // let saveBalance = await db.query(sql, [win_amount, playerId]);
              let saveBalance = await users.updateOne({ id: playerId }, { $inc: { cash_balance: win_amount } })
            }
          }

          let winningAmount = total_win_amount - total_bet_amount;
          playeWinningArray.push({ playerId, winningAmount });
        }
      }
      ////sconsole.log("Winning amount successfuly updated in db");
    }

    return playeWinningArray;
  } catch (err) {
    //sconsole.log(err);
  }
};

const gameMartixRecords = async (data) => {
  try {
    let limit = 105;
    let result = new Array(limit);
   
    let data = await game_record_funtarget.find({})
      .sort({ id: -1 })
      .limit(limit)
      .sort({ id: 1 })
      .select('spot');

    if (isValidArray(data)) {
      result = data.map((win) => win.spot);
    }
    return result;
  } catch (err) {
    //sconsole.log(err);
  }
};



const gameSlotRecords = async (data) => {
  try {
    let limit = 10;
    let result = new Array(limit);
   
    let data = await game_record_funtarget.find({})
      .sort({ id: -1 })
      .limit(limit)
      .sort({ id: 1 })
      .select('winNo1 winNo2');

    if (isValidArray(data)) {
      result = data.map((spot) => {
        return { D: spot.winNo1, T: spot.winNo2 };
      });
    }
    return result;
  } catch (err) {
    //sconsole.log(err);
  }
};


const addwinningpoint = async (playerId, points) => {
  ////sconsole.log("playerId:", playerId, "points:", points);
  try {
    
    let responseData = userByEmail(playerId);
    if (responseData.length > 0) {
     
      const tpoints = parseInt(points) + parseInt(responseData[0].point);
    
      const userss = await AppService.addPointByEmail(playerId, points);


      if (userss) {
        let formData = {
          email: playerId,
          point: points,
        };
      } else {
      }
      //}
    } else {
    }
  } catch (err) {
    //sconsole.log(err);
  }
};
const onbalance = async (playerId) => {
  try {
   
    let result = await users.find({ email: playerId }).select({ point: 1 }).lean();

    return result;
  } catch (err) {
    //sconsole.log(err);
  }
};

const updatePoint = async (playerId, balance) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]["point"];
   
    const userss = await AppService.addPointByEmail(playerId, balance);

    //return result;
  } catch (err) {
    //sconsole.log(err);
  }
};

const FuntargetBets = async (zero, one, two, three, four, five, six, seven, eight, nine, ten, eleven) => {
  ////sconsole.log("zero:", zero, "one:", one, "two:", two, "three:", three, "four:", four, "five:", five, "six:", six, "seven:", seven, "eight:", eight, "nine:", nine);
  try {
    
    let responseData = await funtarget_bet.find({ _id: 1 });

    if (responseData.length > 0) {
      const opoints = parseInt(zero) + parseInt(responseData[0].BetOnZero);
      const ipoints = parseInt(one) + parseInt(responseData[0].BetOnOne);

      const iipoints = parseInt(two) + parseInt(responseData[0].BetOnTwo);
      const iiipoints = parseInt(three) + parseInt(responseData[0].BetOnThree);
      const iiiipoints = parseInt(four) + parseInt(responseData[0].BetOnFour);
      const iiiiipoints = parseInt(five) + parseInt(responseData[0].BetOnFive);
      const iiiiiipoints = parseInt(six) + parseInt(responseData[0].BetOnSix);
      const spoints = parseInt(seven) + parseInt(responseData[0].BetOnSeven);
      const epoints = parseInt(eight) + parseInt(responseData[0].BetOnEight);
      const npoints = parseInt(nine) + parseInt(responseData[0].BetOnNine);
      const tpoints = parseInt(ten) + parseInt(responseData[0].BetOnTen);
      const elpoints = parseInt(eleven) + parseInt(responseData[0].BetOnEleven);

      var formData = {
        BetOnZero: opoints,
        BetOnOne: ipoints,
        BetOnTwo: iipoints,
        BetOnThree: iiipoints,
        BetOnFour: iiiipoints,
        BetOnFive: iiiiipoints,
        BetOnSix: iiiiiipoints,
        BetOnSeven: spoints,
        BetOnEight: epoints,
        BetOnNine: npoints,
        BetOnTen: tpoints,
        BetOnEleven: elpoints


      }
    
      const userss = await funtarget_bet.updateOne({ _id: 1 }, formData);
      // ////sconsole.log('funtarget_bet.updateOne----------', userss)

    }

  } catch (err) {
    //sconsole.log(err);
  }
};

const Detailfuntarget = async (data) => {
  try {
   
    let detail = await funtarget_bet.findOne({ _id: 1 }).lean().select({
      _id: 0,
      BetOnZero: 1, BetOnOne: 1, BetOnTwo: 1, BetOnThree: 1,
      BetOnFour: 1, BetOnFive: 1, BetOnSix: 1, BetOnSeven: 1, BetOnEight: 1, BetOnNine: 1, BetOnTen: 1, BetOnEleven:1

    });

    //sconsole.log("getbetfuntarget  Detailfuntarget ------------ ", detail)

    return detail;
  } catch (err) {
    //sconsole.log(err);
  }
};

const GameRunning = async (playername, RoundCount,
  Zero,
  One,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,Ten, Eleven,
  Win_singleNo,idManager,betpoint, playedTime
  
  ) => {
  try {
    ////sconsole.log("GameRunning-inserting")

    var formData1 = {
      playername: playername,
      RoundCount: RoundCount,
      Zero: Zero,
      One: One,
      Two: Two,
      Three: Three,
      Four: Four,
      Five: Five,
      Six: Six,
      Seven: Seven,
      Eight: Eight,
      Nine: Nine,
      Ten: Ten,
      Eleven: Eleven,

      Win_singleNo: Win_singleNo, 
      idManager:idManager,
      betpoint,playedTime

    }

    let responseData1 = await game_runningfuntarget.create(formData1);

    if (users) {

    }
    return "successfully"
  } catch (err) {
    ////sconsole.log("err", err)
    //sconsole.log(err);

  }
};
const GetGameRunningData = async (playername) => {
  try {
    ////sconsole.log("hello GetGameRunningData")

    let responseData = await game_runningfuntarget.findOne({ playername: playername }).sort({ playedTime: -1 });

    if (responseData) {

      return responseData

    }
    return "no user data exits"
  } catch (err) {
    ////sconsole.log("err", err)
    //sconsole.log(err);

  }
};

const GetPlayerIdInBetplaced = async () => {
  try {

 
    let savePoint = await isbetplacedfun.find({});

    if (savePoint.length > 0) {
      return true
    } else {
      return false
    }

  } catch (err) {
    //sconsole.log(err);
  }
};
const UpdateGameRunningDataWinSingleNumber = async (playername, playedTime, Win_finalNo) => {
  try {

    let responseData = await game_runningfuntarget.updateOne({ playername, playedTime }, { Win_singleNo: Win_finalNo });

    if (responseData) {
      // ////sconsole.log("important", responseData)
      return responseData

    }
    return "no user data exits"
  } catch (err) {
    ////sconsole.log("err", err)
    //sconsole.log(err);

  }
};
const UpdateGameRunningDataWinpoint = async (playername, playedTime, winpoint) => {
  try {
    sconsole.log("hello UpdateGameRunningDataWinpoint------------------------------------------", playername, playedTime, winpoint)
    if (!playername || !playedTime || !winpoint) {
      return
    }

    let responseData = await game_runningfuntarget.updateMany({ playername, playedTime }, { winpoint: winpoint });

    if (responseData) {
      console.log('timestamp worked===================================================',responseData)
      return responseData

    }
    return "no user data exits"
  } catch (err) {
    ////sconsole.log("err", err)
    //sconsole.log(err);

  }
};

const RemovePlayerIdInBetplaced = async (playerId) => {
  try {

    let responseData = await isbetplacedfun.deleteMany({ playerId });


  } catch (err) {
    //sconsole.log(err);
  }
};
const GetGameHistoryGameRunningData = async () => {
  try {

    let responseData = await game_runningfuntarget.find({}).sort({ playedTime: -1 }).limit(6);

    if (responseData.length > 0) {

      return responseData

    }
    return "no user data exits"
  } catch (err) {
    ////sconsole.log("err", err)
    //sconsole.log(err);

  }
};
const AddPlayerIdInBetplaced = async (playerId) => {
  ////sconsole.log('isbetplacedfun-create')
  try {
    var formdata = {
      playerId: playerId
    }

    let agent = await isbetplacedfun.find({ playerId }).lean();

    if (agent.length > 0) {
    }
    else {
 
      let agent = await isbetplacedfun.create(formdata);
    }
  } catch (err) {
    //sconsole.log(err);
  }
};







const RemovefunBetsAll = async (tigerbet, dragonbet) => {
  ////sconsole.log('RemovefunBetsAll');
  //  ////sconsole.log("zero:",zero,"one:",one,"two:",two,"three:",three,"four:",four,"five:",five,"six:",six,"seven:",seven,"eight:",eight,"nine:",nine);
  try {
    var formData = {
      BetOnZero: 0,
      BetOnOne: 0,
      BetOnTwo: 0,
      BetOnThree: 0,
      BetOnFour: 0,
      BetOnFive: 0,
      BetOnSix: 0,
      BetOnSeven: 0,
      BetOnEight: 0,
      BetOnNine: 0,
      BetOnTen:0,
      BetOnEleven:0

    }
   
    const userss = await funtarget_bet.updateOne({ _id: 1 }, formData, { upsert: true })

  }

  catch (err) {
    //sconsole.log(err);
  }
};
const PlayerDetails = async (playername, RoundCount,
  winNo, WinX) => {
  try {
    ////sconsole.log("funtarget_playerdetail-insert")

    var formData1 = {
      playername: playername,
      RoundCount: RoundCount,
      winNo: winNo,
      WinX: WinX
    }

    if (users) {

    }
    return "successfully"
  } catch (err) {
    ////sconsole.log("err", err)
    //sconsole.log(err);

  }
};

const RemoveAllplayer = async () => {
  ////sconsole.log('RemoveAllplayer-ft')
  try {
   
    const userss = await isbetplacedfun.deleteMany({});
  } catch (err) {
    //sconsole.log(err);
  }
};
const getAdminfuntarget = async () => {
  ////sconsole.log('getAdminfuntarget-ft')

  try {

    
    let updateResponse = await admin_funtarget.findOne({ _id: 1 });;
    if (updateResponse) {
      return updateResponse;
    } else {
      return false
    }

  } catch (error) {
    ////sconsole.log("error", error)
    ////sconsole.log(error);

  }
};
const WinamountDetails = async (playerId, game_id, point) => {
  ////sconsole.log('WinamountDetails-ft')

  await AppService.WinamountDetails(playerId, game_id, point)

};
const GetAllplayer = async () => {
  ////sconsole.log('isbetplacedfun-all-players')
  try {
    // var sql = "Select * from isbetplacedfun";
    // const userss = await db.query(sql);
    const userss = await isbetplacedfun.find({}).lean();

    return userss;
  } catch (err) {
    //sconsole.log(err);
  }
};

module.exports = {
  GetAllplayer,
  WinamountDetails,
  getAdminfuntarget,
  RemoveAllplayer,
  PlayerDetails,
  GameRunning,
  RemovefunBetsAll,
  AddPlayerIdInBetplaced,
  RemovePlayerIdInBetplaced,
  UpdateGameRunningDataWinpoint,
  GetGameHistoryGameRunningData,
  GetPlayerIdInBetplaced,
  UpdateGameRunningDataWinSingleNumber,
  GetGameRunningData,
  Detailfuntarget,
  FuntargetBets,
  JoinGame,
  onbalance,
  addwinningpoint,
  updatePoint,
  lastWinningNo,
  getRoundCount,
  updateUserPoint,
  getUserPoint,
  updateWinningNo,
  updateWinningAmount,
  getUserBalance,
  gameMartixRecords,
  gameSlotRecords,
};

