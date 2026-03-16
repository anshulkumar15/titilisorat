"use strict";
const debug = require("debug")("test");
// const db = require("../config/db.js");

const users = require("../models/users");
const join_game = require("../models/join_game");
const winpoint_details = require("../models/winpoint_details");
const AppService = require("./AppService");


const admin_7up = require("../models/admin_7up");
const game_record_sevenup = require("../models/game_record_triplechance");
const sevenup_bet = require("../models/sevenup_bet");
const game_running = require("../models/game_running_sevenup");
const isbetplaced = require("../models/isbetplaced");
//const seven_playerdetail = require("../models/seven_playerdetail");

const commonVar = require("../Constants").commonVar;

// const userById = async (playerId) => {
//   try {
//     let sql = `SELECT * FROM users WHERE id= ? limit ?`;
//     let user = await db.query(sql, [playerId, 1]);
//     return user;
//   } catch (err) {
//       console.log(err);
//   }
// };

const getUserBalance = async (playerId) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]["cash_balance"];
    return result;
  } catch (err) {
    console.log(err);
  }
};

const userByEmail = async (playerId) => {
  try {
    // let sql = `SELECT * FROM users WHERE email= ? limit ?`;
    // let user = await db.query(sql, [playerId, 1]);
    let user = await users.find({ email: playerId }).limit(1).lean();
    return user;
  } catch (err) {
    console.log(err);
  }
};

const getUserPoint = async (playerId, betPoints) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]["point"];
    // let sql = `UPDATE users SET point= ? WHERE email= ? `;
    // let savePoint = await db.query(sql, [result - betPoints, playerId]);
    const userss = await AppService.addPointByEmail(playerId, -betPoints);


    return result;
  } catch (err) {
    console.log(err);
  }
};

const updateUserPoint = async (playerId, winPoints) => {
  try {
    let user = await userByEmail(playerId);
    let result = user[0]["point"];
    // let sql = `UPDATE users SET point= ? WHERE email= ? `;
    // let savePoint = await db.query(sql, [result + winPoints, playerId]);
    let savePoint = await users.updateOne({ email: playerId }, { point: result + winPoints })

    let user1 = await userByEmail(playerId);
    let result1 = user1[0]["point"];

    return result1;
  } catch (err) {
    console.log(err);
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
    // let sql = `SELECT room_id FROM game_record_sevenup ORDER BY id DESC LIMIT ?`;
    // let result = await db.query(sql, limit);
    let result = game_record_sevenup.find({}).sort({ _id: -1 }).limit(1)
    let roundCount = result[result.length - 1]["room_id"] + 1;
    return roundCount;
  } catch (err) {
    console.log(err);
  }
};

const JoinGame = async (data, room_id) => {
  try {
    let user = await userById(data.playerId);
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
        // let sql = "Insert Into join_game Set ?";
        // let saveBet = await db.query(sql, parms);
        let saveBet = await join_game.create(parms);


        if (
          saveBet != null &&
          saveBet != undefined &&
          Object.keys(saveBet).length != 0
        ) {
          cash_balance -= chip_amt;
          // sql = `UPDATE users SET cash_balance= ? WHERE id= ? `;
          // let saveBalance = await db.query(sql, [cash_balance, data.playerId]);
          let saveBalance = await users.updateOne({ id: data.playerId }, { cash_balance: cash_balance })

        }
      }
    }
    console.log("player bet successfully add to db");
    return true;
  } catch (err) {
    console.log(err);
  }
};

const lastWinningNo = async () => {
  try {
    let limit = 20;
    let result = new Array(limit);
    //     let sql = `SELECT spot FROM (SELECT * FROM game_record_sevenup
    //  ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
    // let data = await db.query(sql, limit);
    let data =
      await game_record_sevenup.find({})
        .sort({ id: -1 })
        .limit(limit)
        .sort({ id: 1 })
        .select('spot')
    if (isValidArray(data)) {
      for (var i = 0; i < data.length; i++) {
        let spot = data[i].spot;
        result[limit - 1 - i] = spot;
      }
    }
    return result;
  } catch (err) {
    console.log(err);
  }
};

const updateWinningNo = async (data) => {
  try {
    let parms = data;
    // let sql = "Insert Into game_record_sevenup Set ?";
    // let query = await db.query(sql, parms);
    await game_record_sevenup.create(parms);
    console.log("Winning no. inserted successfuly to db");
    return true;
  } catch (err) {
    console.log(err);
  }
};

const updateWinningAmount = async (data) => {
  try {
    let winningspot = data["spot"];
    let rate = winningspot === 0 || winningspot === 2 ? 2 : 8; //winning amt multile
    let game_id = 6;
    let room_id = data["room_id"];
    let playeWinningArray = [];

    // let sql = `SELECT user_id FROM join_game WHERE game_id= ? AND room_id= ? AND is_updated= ? GROUP BY user_id `;
    // let players = await db.query(sql, [game_id, room_id, 0]);
    let conditions = { 'game_id': game_id, 'room_id': room_id, 'is_updated': 0 };
    let players = await join_game.find(conditions).distinct('user_id');

    if (isValidArray(players)) {
      for (let player of players) {
        let playerId = player["user_id"];
        // let sql = `SELECT spot,amount FROM join_game WHERE game_id= ? AND room_id= ? AND user_id= ? `;
        // let bets = await db.query(sql, [game_id, room_id, playerId]);
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

            // sql = `UPDATE join_game SET  win_amount=? ,is_updated=?  WHERE game_id= ? AND room_id= ? AND user_id= ?  `;
            // let update_sql = await db.query(sql, [
            //   win_amount,
            //   1,
            //   game_id,
            //   room_id,
            //   playerId,
            // ]);
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
      console.log("Winning amount successfuly updated in db");
    }

    return playeWinningArray;
  } catch (err) {
    console.log(err);
  }
};

const gameMartixRecords = async (data) => {
  try {
    let limit = 105;
    let result = new Array(limit);
    //     let sql = `SELECT spot FROM (SELECT * FROM game_record_sevenup
    //  ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
    //     let data = await db.query(sql, limit);
    let data = await game_record_sevenup.find({})
      .sort({ id: -1 })
      .limit(limit)
      .sort({ id: 1 })
      .select('spot');

    if (isValidArray(data)) {
      result = data.map((win) => win.spot);
    }
    return result;
  } catch (err) {
    console.log(err);
  }
};

// const gameMartixRecords = async(data) => {
//     try{

//         let limit = 210;
//         let maxColumn = 21;
//         let maxRow = 5;
//         let result = new Array(maxColumn);
//         let arr = [];
//         let sql =  `SELECT spot FROM game_record_TripleChan ORDER BY id DESC LIMIT ?`
//         let data = await db.query(sql,limit);
//         if(isValidArray(data)){

//             for (var i = 0; i < data.length; i++) {
//                 let len = arr.length;
//                 if((arr[len-1] != undefined) && (arr[len-1][0] === data[i].spot) && (arr[len-1].length < maxRow)) {
//                     arr[len-1].push(data[i].spot);
//                 }else{
//                     arr[len] = [data[i].spot]
//                     maxColumn--;
//                 }
//                 if(maxColumn === 0) break;
//             }
//             result = arr.reverse();
//         }
//         return result
//     } catch (err) {
//           console.log(err);
//     }
// }

const gameSlotRecords = async (data) => {
  try {
    let limit = 10;
    let result = new Array(limit);
    //     let sql = `SELECT winNo1,winNo2 FROM (SELECT * FROM game_record_sevenup
    //  ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
    //     let data = await db.query(sql, limit);
    let data = await game_record_sevenup.find({})
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
    console.log(err);
  }
};

const addwinningpoint = async (playerId, points) => {
  console.log("playerId:", playerId, "points:", points);
  try {
    // let sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
    // let responseData = await db.query(sql, [playerId, 1]);
    let responseData = userByEmail(playerId);

    if (responseData.length > 0) {
      // sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
      // responseData = await db.query(sql, [playerId, 1]);
      if (responseData.length > 0) {
        const tpoints = parseInt(points) + parseInt(responseData[0].point);
        // sql = "UPDATE users SET point= ? WHERE email=?";
        // const userss = await db.query(sql, [tpoints, playerId]);
        const userss = await AppService.addPointByEmail(email, points);

        if (userss) {
          let formData = {
            email: playerId,
            point: points,
          };
        } else {
        }
      }
    } else {
    }
  } catch (err) {
    console.log(err);
  }
};
const onbalance = async (playerId) => {
  try {
    //let limit = 1;
    //let sql = `SELECT point FROM users where email =? `;
    let result = await userByEmail(playerId);

    return result;
  } catch (err) {
    console.log(err);
  }
};

const SevenupBets = async (two_sixbet, sevenbet, eight_twelvebet) => {
  console.log(
    "two_sixbet:",
    two_sixbet,
    "sevenbet:",
    sevenbet,
    "eight_twelvebet:",
    eight_twelvebet
  );
  try {
    // let sql = `SELECT * FROM sevenup_bet  `;
    // let responseData = await db.query(sql, []);
    let responseData = await sevenup_bet.find({ _id: 1 });

    if (responseData.length > 0) {
      // sql = `SELECT * FROM sevenup_bet  `;
      // responseData = await db.query(sql, []);
      if (responseData.length > 0) {
        const tpoints =
          parseInt(two_sixbet) + parseInt(responseData[0].two_six);
        const spoints = parseInt(sevenbet) + parseInt(responseData[0].seven);

        const dpoints =
          parseInt(eight_twelvebet) + parseInt(responseData[0].eight_twelve);
        var formData = {
          two_six: tpoints,
          eight_twelve: dpoints,
          seven: spoints,
        };
        // sql = "UPDATE sevenup_bet SET ?";
        // const userss = await db.query(sql, [formData]);
        const userss = await sevenup_bet.updateOne({ _id: 1 }, formData);

        if (userss) {

        }
      }
    } else {
    }
  } catch (err) {
    console.log(err);
  }
};

const DetailSevenup = async (data) => {
  try {
    // let sql = "SELECT * FROM sevenup_bet ";
    // let detail = await db.query(sql);
    let detail = await sevenup_bet.findOne({ _id: 1 });

    //  console.log("Winning no. inserted successfuly to db");
    return detail;
  } catch (err) {
    console.log(err);
  }
};

const GameRunning = async (
  playername,
  RoundCount,
  singleNo,
  doubleNo,
  tripleNo,
  Win_finalNo
) => {
  try {
    console.log("hello");

    var formData1 = {
      playername: playername,
      RoundCount: RoundCount,
      singleNo: singleNo,
      doubleNo: doubleNo,
      tripleNo: tripleNo,
      Win_finalNo: Win_finalNo,
    };
    // let sql = `SELECT * FROM game_running WHERE playername = ? `;
    // let responseData = await db.query(sql, playername);
    // let responseData = await game_running_sevenup.find({playername});

    /*   if (responseData.length > 0) {
          sql = "UPDATE game_running SET singleNo=?,doubleNo=?,tripleNo=?,Win_singleNo=? WHERE playername =? ";
  
          const userss = await db.query(sql,  [singleNo,doubleNo,tripleNo,Win_singleNo ,playername]);
              
          ;
           }
       */ // else {
    // sql = "INSERT INTO  game_running SET ?";
    // const users = await db.query(sql, formData1);
    let responseData1 = await game_running_sevenup.create(formData1);

    if (users) {
    }
    return "successfully";
  } catch (err) {
    console.log("err", err);
    console.log(err);
  }
};

const GetGameRunningData = async (playername) => {
  try {
    console.log("hello GetGameRunningData");

    // let sql = `SELECT * FROM game_running WHERE playername = ? order by playerTime desc limit 1 `;
    // let responseData = await db.query(sql, playername);
    let responseData = await game_running_sevenup.find({ playername: playername }).sort({ playedTime: -1 }).limit(1);

    if (responseData.length > 0) {
      return responseData[0];
    }
    return "no user data exits";
  } catch (err) {
    console.log("err", err);
    console.log(err);
  }
};
const UpdateGameRunningDataWinSingleNumber = async (
  playername,
  playerTime,
  Win_finalNo
) => {
  try {
    console.log("hello UpdateGameRunningDataWinSingleNumber");

    // let sql = `update game_running set Win_finalNo=?  WHERE playername = ? And playerTime=?  `;
    // let responseData = await db.query(sql, [
    //   Win_finalNo,
    //   playername,
    //   playerTime,
    // ]);
    let responseData = await game_running_sevenup.updateMany({ playername, playerTime }, { Win_finalNo: Win_finalNo });

    if (responseData) {
      //console.log("important", responseData);
      return responseData;
    }
    return "no user data exits";
  } catch (err) {
    console.log("err", err);
    console.log(err);
  }
};

const UpdateGameRunningDataWinpoint = async (
  playername,
  playedTime,
  winpoint
) => {
  try {
    console.log("hello UpdateGameRunningDataWinpoint");

    // let sql = `update game_running set winpoint=?  WHERE playername = ? And playerTime=?  `;
    // let responseData = await db.query(sql, [winpoint, playername, playerTime]);
    let responseData = await game_running_sevenup.updateMany({ playername, playedTime }, { winpoint: winpoint });

    if (responseData) {
      console.log(responseData);
      return responseData;
    }
    return "no user data exits";
  } catch (err) {
    console.log("err", err);
    console.log(err);
  }
};

const RemovePlayerIdInBetplaced = async (playerId) => {
  try {
    // let sql = `Delete From isbetplaced where playerId= ? `;
    // let savePoint = await db.query(sql, [playerId]);
    let responseData = await isbetplaced.deleteMany({ playerId });


  } catch (err) {
    console.log(err);
  }
};

const GetGameHistoryGameRunningData = async () => {
  try {
    console.log("hello GetGameHistoryGameRunningData");

    // let sql = `SELECT * FROM game_running  order by playerTime desc limit 6 `;
    // let responseData = await db.query(sql);
    let responseData = await game_running_sevenup.find({}).sort({ playedTime: -1 }).limit(6);

    if (responseData.length > 0) {
      return responseData;
    }
    return "no user data exits";
  } catch (err) {
    console.log("err", err);
    console.log(err);
  }
};
const GetPlayerIdInBetplaced = async () => {
  try {
    // let sql = `Select * From isbetplaced  `;
    // let savePoint = await db.query(sql, []);
    const savePoint = await isbetplaced.find({});

    if (savePoint.length > 0) {
      return true;
    } else {
      return false;
    }

  } catch (err) {
    console.log(err);
  }
};

const AddPlayerIdInBetplaced = async (playerId) => {
  try {
    var formdata = {
      playerId: playerId,
    };
    // let sql = `SELECT * FROM isbetplaced WHERE playerId = ? `;
    // let agent = await db.query(sql, [playerId]);
    const agent = await isbetplaced.find({ playerId });

    if (agent.length > 0) {
    }
    else {

      // let sql = `Insert into isbetplaced set ? `;
      // let savePoint = await db.query(sql, [formdata]);
      const agent = await isbetplaced.create(formdata);


    }
  } catch (err) {
    console.log(err);
  }
};

const Remove7BetAll = async () => {
  // console.log("dragonbet:", dragonbet, "tigerbet:", tigerbet);
  try {
    var formData = {
      two_six: 0,
      seven: 0,
      eight_twelve: 0,
    };
    // let sql = "UPDATE sevenup_bet SET ?";
    // const userss = await db.query(sql, [formData]);
    const userss = await sevenup_bet.updateOne({ _id: 1 }, formData, { upsert: true });
  } catch (err) {
    console.log(err);
  }
};
const RemoveAllplayer = async () => {
  try {
    // var sql = "Delete from isbetplaced";
    // const userss = await db.query(sql);
    const userss = await isbetplaced.deleteMany({});
  } catch (err) {
    console.log(err);
  }
};

const PlayerDetails = async (playername, RoundCount, dice1, dice2, wintype) => {
  try {
    console.log("hello");

    var formData1 = {
      playername: playername,
      RoundCount: RoundCount,
      dice1: dice1,
      dice2: dice2,

      wintype: wintype,
    };
    // let sql = `SELECT * FROM seven_playerdetail WHERE playername = ? `;
    // let responseData = await db.query(sql, playername);
    /*   if (responseData.length > 0) {
          sql = "UPDATE seven_playerdetail SET singleNo=?,doubleNo=?,tripleNo=?,Win_singleNo=? WHERE playername =? ";
  
          const userss = await db.query(sql,  [singleNo,doubleNo,tripleNo,Win_singleNo ,playername]);
              
          ;
           }
       */ // else {
    // sql = "INSERT INTO  seven_playerdetail SET ?";
    // const users = await db.query(sql, formData1);
   // const users = await seven_playerdetail.create(formData1);

    if (users) {
    }
    return "successfully";
  } catch (err) {
    console.log("err", err);
    console.log(err);
  }
};

const getAdmin7up = async () => {
  try {
    // let sql = "select * from admin_7up ";
    // let updateResponse = await db.query(sql);
    const updateResponse = await admin_7up.findOne({ _id: 1 });

    if (updateResponse) {
      return updateResponse;
    } else {
      return false;
    }
  } catch (error) {
    console.log("error", error);
    console.log(error);
  }
};

const WinamountDetails = async (playerId, game_id, point) => {
  await AppService.WinamountDetails(playerId, game_id, point)

  // try {
  //    console.log("hello");

  //   var formData1 = {
  //     playerId: playerId,
  //     game_id: game_id,
  //     point: point,
  //   };
  //   // let sql = `SELECT * FROM winpoint_details WHERE playerId= ? AND game_id= ? `;
  //   // let responseData = await db.query(sql, [playerId, game_id]);
  //   let responseData = await winpoint_details.find({playerId,game_id}); 

  //   if (responseData.length > 0) {
  //     //let user = await userByEmail(playerId);

  //     let result = responseData[0]["point"];

  //     // sql = "UPDATE winpoint_details SET point=? WHERE playerId =? AND game_id= ? ";
  //     // const userss = await db.query(sql, [result + point, playerId, game_id]);
  //     const userss = await winpoint_details.updateOne({playerId, game_id}, {point:result + point});

  //      console.log("databaseupdated", userss);
  //     //let user1 = await userByEmail(playerId);
  //     // let result1 = userss[0]["point"];

  //     // return result1;

  //      console.log("WinAmount:-------------------------------", userss);
  //   } else {
  //     // sql = "INSERT INTO  winpoint_details SET ?";
  //     // const users = await db.query(sql, formData1);
  //     const users = await winpoint_details.create(formData1);

  //     if (users) {
  //     }
  //     return "successfully";
  //   }
  // } catch (err) {
  //    console.log("err", err);
  //     console.log(err);
  // }
};
const GetAllplayer = async () => {
  try {
    // var sql = "Select * from isbetplaced";
    // const userss = await db.query(sql);
    const users = await isbetplaced.find({});

    return users;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  GetAllplayer,
  WinamountDetails,
  RemoveAllplayer,
  getAdmin7up,
  PlayerDetails,
  Remove7BetAll,
  AddPlayerIdInBetplaced,
  GetPlayerIdInBetplaced,
  GetGameHistoryGameRunningData,
  RemovePlayerIdInBetplaced,
  UpdateGameRunningDataWinpoint,
  UpdateGameRunningDataWinSingleNumber,
  GetGameRunningData,
  GameRunning,
  DetailSevenup,
  SevenupBets,
  JoinGame,
  addwinningpoint,
  onbalance,
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
