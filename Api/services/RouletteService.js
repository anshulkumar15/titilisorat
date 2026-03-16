"use strict";
//const //debug = require("//debug")("test");
const users = require("../models/users");
const join_game = require("../models/join_game");

const game_record_roulette = require("../models/game_record_roulette");
const AppService = require("./AppService");

const rouletebet = require("../models/rouletebet");
const game_running_roulette = require("../models/game_running_roulette");
const isbetplacedroulette = require("../models/isbetplacedroulette");
//const roulette_playerdetails = require("../models/roulette_playerdetails");
const admin_roulette = require("../models/admin_roulette");
const commonVar = require("../Constants").commonVar;


const getUserBalance = async (playerId) => {
  try {
    // console.log('getUserBalance', playerId)
    let user = await users.find({ _id: playerId }).select('cash_balance').lean();
    let result = user[0]["cash_balance"];
    return result;
  } catch (err) {
    console.log(err);
  }
};

const userByEmail = async (playerId) => {
  try {
    let user = await users.find({ email: playerId }).limit(1).lean();
    return user;
  } catch (err) {
    console.log(err);
  }
};

const getUserPoint = async (playerId, betPoints) => {
  try {
    
  let  result= await AppService.addPointByEmail(playerId, -betPoints);

    return result;
  } catch (err) {
    console.log(err);
  }
};

const updateUserPoint = async (playerId, winPoints) => {
  try {
  
    let savePoint = await AppService.addPointByEmail(playerId, winPoints);
    return savePoint.point;
    //return result;
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
    // let sql = `SELECT room_id FROM game_record_roulette ORDER BY id DESC LIMIT ?`;
    // let result = await db.query(sql, limit);
    let result = game_record_roulette.find({}).sort({ _id: -1 }).limit(1).lean()
    let roundCount = result[result.length - 1]["room_id"] + 1;
    return roundCount;
  } catch (err) {
    console.log(err);
  }
};

const JoinGame = async (data, room_id) => {
  try {
    let user = await users.findById(data.playerId).lean();
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
          let saveBalance = await users.updateOne({ _id: data.playerId }, { cash_balance: cash_balance })

        }
      }
    }
    //  // console.log("player bet successfully add to db");
    return true;
  } catch (err) {
    console.log(err);
  }
};

const lastWinningNo = async () => {
  try {
    let limit = 20;
    let result = new Array(limit);
    //     let sql = `SELECT spot FROM (SELECT * FROM game_record_roulette
    //  ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
    //     let data = await db.query(sql, limit);
    let data =
      await game_record_roulette.find({}).lean()
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
    console.log(err);
  }
};

const updateWinningNo = async (data) => {
  try {
    let parms = data;
    // let sql = "Insert Into game_record_roulette Set ?";
    // let query = await db.query(sql, parms);
    //  // console.log("Winning no. inserted successfuly to db");
    await game_record_roulette.create(parms);

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
      //  // console.log("Winning amount successfuly updated in db");
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
    //     let sql = `SELECT spot FROM (SELECT * FROM game_record_roulette
    //  ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
    //     let data = await db.query(sql, limit);

    let data = await game_record_roulette.find({}).lean()
      .sort({ id: -1 })
      .limit(limit)
      .sort({ id: 1 })
      .select('spot').lean();
    if (isValidArray(data)) {
      result = data.map((win) => win.spot);
    }
    return result;
  } catch (err) {
    console.log(err);
  }
};

const gameSlotRecords = async (data) => {
  try {
    let limit = 10;
    let result = new Array(limit);
    //     let sql = `SELECT winNo1,winNo2 FROM (SELECT * FROM game_record_roulette
    //  ORDER BY id DESC LIMIT ?) sub ORDER BY id ASC`;
    //     let data = await db.query(sql, limit);
    let data = await game_record_roulette.find({}).lean()
      .sort({ id: -1 })
      .limit(limit)
      .sort({ id: 1 })
      .select({ _id: 0, winNo1: 1, winNo2: 1 });

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

const RemoveRouletteBetsAll = async () => {
  // // // console.log("zero:",zero,"one:",one,"two:",two,"three:",three,"four:",four,"five:",five,"six:",six,"seven:",seven,"eight:",eight,"nine:",nine);
  try {
    let formData = {
      straightUp: 0,
      Split: 0,
      Street: 0,
      Corner: 0,
      specificBet: 0,
      line: 0,
      dozen1: 0,
      dozen2: 0,
      dozen3: 0,
      column1: 0,
      column2: 0,
      column3: 0,
      onetoEighteen: 0,
      nineteentoThirtysix: 0,
      even: 0,
      odd: 0,
      black: 0,
      red: 0,
      bet00: 0,
      bet0: 0,
      bet1: 0,
      bet2: 0,
      bet3: 0,
      bet4: 0,
      bet5: 0,
      bet6: 0,
      bet7: 0,
      bet8: 0,
      bet9: 0,
      bet10: 0,
      bet11: 0,
      bet12: 0,
      bet13: 0,
      bet14: 0,
      bet15: 0,
      bet16: 0,
      bet17: 0,
      bet18: 0,
      bet19: 0,
      bet20: 0,
      bet21: 0,
      bet22: 0,
      bet23: 0,
      bet24: 0,
      bet25: 0,
      bet26: 0,
      bet27: 0,
      bet28: 0,
      bet29: 0,
      bet30: 0,
      bet31: 0,
      bet32: 0,
      bet33: 0,
      bet34: 0,
      bet35: 0,
      bet36: 0,
      bet00Value: 0, bet0Value: 0, bet1Value: 0, bet2Value: 0, bet3Value: 0, bet4Value: 0,
  bet5Value: 0, bet6Value: 0, bet7Value: 0, bet8Value: 0, bet9Value: 0, bet10Value: 0,
  bet11Value: 0, bet12Value: 0, bet13Value: 0, bet14Value: 0, bet15Value: 0,
  bet16Value: 0, bet17Value: 0, bet18Value: 0, bet19Value: 0, bet20Value: 0,
  bet21Value: 0, bet22Value: 0, bet23Value: 0, bet24Value: 0, bet25Value: 0,
  bet26Value: 0, bet27Value: 0, bet28Value: 0, bet29Value: 0, bet30Value: 0,
  bet31Value: 0, bet32Value: 0, bet33Value: 0, bet34Value: 0, bet35Value: 0, bet36Value: 0
    };

   let userss = await rouletebet.updateOne({ _id: 1 }, formData, { upsert: true });
    console.log('-----------RemoveRouletteBetsAll------------------',userss);
  } catch (err) {
    console.log(err);
  }
};

const Detailroulete = async (data) => {
  try {
    let selectField = {
      _id: 0,
      bet00: 1,
      bet0: 1,
      bet1: 1,
      bet2: 1,
      bet3: 1,
      bet4: 1,
      bet5: 1,
      bet6: 1,
      bet7: 1,
      bet8: 1,
      bet9: 1,
      bet10: 1,
      bet11: 1,
      bet12: 1,
      bet13: 1,
      bet14: 1,
      bet15: 1,
      bet16: 1,
      bet17: 1,
      bet18: 1,
      bet19: 1,
      bet20: 1,
      bet21: 1,
      bet22: 1,
      bet23: 1,
      bet24: 1,
      bet25: 1,
      bet26: 1,
      bet27: 1,
      bet28: 1,
      bet29: 1,
      bet30: 1,
      bet31: 1,
      bet32: 1,
      bet33: 1,
      bet34: 1,
      bet35: 1,
      bet36: 1,
  //    bet00Value: 1, bet0Value: 1, bet1Value: 1, bet2Value: 1, bet3Value: 1, bet4Value: 1,
  // bet5Value: 1, bet6Value: 1, bet7Value: 1, bet8Value: 1, bet9Value: 1, bet10Value: 1,
  // bet11Value: 1, bet12Value: 1, bet13Value: 1, bet14Value: 1, bet15Value: 1,
  // bet16Value: 1, bet17Value: 1, bet18Value: 1, bet19Value: 1, bet20Value: 1,
  // bet21Value: 1, bet22Value: 1, bet23Value: 1, bet24Value: 1, bet25Value: 1,
  // bet26Value: 1, bet27Value: 1, bet28Value: 1, bet29Value: 1, bet30Value: 1,
  // bet31Value: 1, bet32Value: 1, bet33Value: 1, bet34Value: 1, bet35Value: 1, bet36Value: 1

    };


    const detail = await rouletebet.findOne({ _id: 1 }).select(selectField).lean();

    // console.log('getbetroulette-- Detailroulete------', detail)
    return detail;
  } catch (err) {
    console.log(err);
  }
};

const DetailrouleteValue = async (data) => {
  try {
    let selectField = {
      _id: 0,
     bet00Value: 1, bet0Value: 1, bet1Value: 1, bet2Value: 1, bet3Value: 1, bet4Value: 1,
  bet5Value: 1, bet6Value: 1, bet7Value: 1, bet8Value: 1, bet9Value: 1, bet10Value: 1,
  bet11Value: 1, bet12Value: 1, bet13Value: 1, bet14Value: 1, bet15Value: 1,
  bet16Value: 1, bet17Value: 1, bet18Value: 1, bet19Value: 1, bet20Value: 1,
  bet21Value: 1, bet22Value: 1, bet23Value: 1, bet24Value: 1, bet25Value: 1,
  bet26Value: 1, bet27Value: 1, bet28Value: 1, bet29Value: 1, bet30Value: 1,
  bet31Value: 1, bet32Value: 1, bet33Value: 1, bet34Value: 1, bet35Value: 1, bet36Value: 1

    };


    const detail = await rouletebet.findOne({ _id: 1 }).select(selectField).lean();

    // console.log('getbetroulette-- Detailroulete------', detail)
    return detail;
  } catch (err) {
    console.log(err);
  }
};

const GameRunning = async (
  playername,
  RoundCount,
  straightUp,
  Split,
  Street,
  Corner,
  specificBet,
  line,
  dozen1,
  dozen2,
  dozen3,
  column1,
  column2,
  column3,
  onetoEighteen,
  nineteentoThirtysix,
  even,
  odd,
  black,
  red,
  straightUpVal,
  SplitVal,
  StreetVal,
  CornerVal,
  specificBetVal,
  lineVal,
  dozen1Val,
  dozen2Val,
  dozen3Val,
  column1Val,
  column2Val,
  column3Val,
  onetoEighteenVal,
  nineteentoThirtysixVal,
  evenVal,
  oddVal,
  blackVal,
  redVal,
  

  Win_singleNo,idManager,betpoint,playedTime
) => {
  try {
    //// console.log("hello");

    var formData1 = {
      playername: playername,
      RoundCount: RoundCount,
      straightUp: straightUp,
      Split: Split,
      Street: Street,
      Corner: Corner,
      specificBet: specificBet,
      line: line,
      dozen1: dozen1,
      dozen2: dozen2,
      dozen3: dozen3,
      column1: column1,
      column2: column2,
      column3: column3,
      onetoEighteen: onetoEighteen,
      nineteentoThirtysix: nineteentoThirtysix,
      even: even,
      odd: odd,
      black: black,
      red: red,

      straightUpVal: straightUpVal,
      SplitVal: SplitVal,
      StreetVal: StreetVal,
      CornerVal: CornerVal,
      specificBetVal: specificBetVal,
      lineVal: lineVal,
      dozen1Val: dozen1Val,
      dozen2Val: dozen2Val,
      dozen3Val: dozen3Val,
      column1Val: column1Val,
      column2Val: column2Val,
      column3Val: column3Val,
      onetoEighteenVal: onetoEighteenVal,
      nineteentoThirtysixVal: nineteentoThirtysixVal,
      evenVal: evenVal,
      oddVal: oddVal,
      blackVal: blackVal,
      redVal: redVal,

      Win_singleNo: Win_singleNo,
      idManager:idManager,
      betpoint,playedTime
    };

    await game_running_roulette.create(formData1);
    
    return "successfully";
  } catch (err) {
    // // console.log("err", err);
    console.log(err);
  }
};

const GetPlayerIdInBetplaced = async () => {
  try {
    let savePoint = await isbetplacedroulette.find({}).lean();
    if (savePoint.length > 0) {
      return true;
    } else {
      return false;
    }
    //
  } catch (err) {
    console.log(err);
  }
};
const GetGameRunningData = async (playername) => {
  try {
     let responseData = await game_running_roulette.find({ playername }).sort({ playedTime: -1 }).limit(1).lean();

    if (responseData.length > 0) {
      return responseData[0];
    }
    return "no user data exits";
  } catch (err) {
    // // console.log("err", err);
    console.log(err);
  }
};
const UpdateGameRunningDataWinSingleNumber = async (
  playername,
  playedTime,
  Win_singleNo,winpoint
) => {
  try {
    // console.log("hello UpdateGameRunningDataWinSingleNumber");
    let responseData = await game_running_roulette.updateMany({ playername, playedTime }, { Win_singleNo,winpoint });
    
    if (responseData) {
      // // console.log("important", responseData);
      return responseData;
    }
    return "no user data exits";
  } catch (err) {
    // // console.log("err", err);
    console.log(err);
  }
};
const UpdateGameRunningDataWinpoint = async (
  playername,
  playedTime,
  winpoint
) => {
  try {
    let responseData = await game_running_roulette.updateMany({ playername, playedTime }, { winpoint });

    if (responseData) {
      // // console.log(responseData);
      return responseData;
    }
    return "no user data exits";
  } catch (err) {
    // // console.log("err", err);
    console.log(err);
  }
};

const RemovePlayerIdInBetplaced = async (playerId) => {
  try {
     
    await isbetplacedroulette.deleteMany({ playerId });
    //
  } catch (err) {
    console.log(err);
  }
};
const onbalance = async (playerId) => {
  try {
    
    let result = await userByEmail(playerId);
    return result;
  } catch (err) {
    console.log(err);
  }
};

const AddPlayerIdInBetplaced = async (playerId) => {
  try {

    await isbetplacedroulette.updateOne({ playerId }, { playerId }, { upsert: true });
  } catch (err) {
    console.log(err);
  }
};

const RouletteBets = async (
  straightUpVal,
  SplitVal,
  StreetVal,
  CornerVal,
  specificBetVal,
  lineVal,
  dozen1Val,
  dozen2Val,
  dozen3Val,
  column1Val,
  column2Val,
  column3Val,
  onetoEighteen,
  nineteentoThirtysix,
  evenVal,
  odd,
  blackVal,
  redVal,
  Bet00,
  Bet0,
  Bet1,
  Bet2,
  Bet3,
  Bet4,
  Bet5,
  Bet6,
  Bet7,
  Bet8,
  Bet9,
  Bet10,
  Bet11,
  Bet12,
  Bet13,
  Bet14,
  Bet15,
  Bet16,
  Bet17,
  Bet18,
  Bet19,
  Bet20,
  Bet21,
  Bet22,
  Bet23,
  Bet24,
  Bet25,
  Bet26,
  Bet27,
  Bet28,
  Bet29,
  Bet30,
  Bet31,
  Bet32,
  Bet33,
  Bet34,
  Bet35,
  Bet36,
  Bet00Value,
  Bet0Value,
  Bet1Value,
  Bet2Value,
  Bet3Value,
  Bet4Value,
  Bet5Value,
  Bet6Value,
  Bet7Value,
  Bet8Value,
  Bet9Value,
  Bet10Value,
  Bet11Value,
  Bet12Value,
  Bet13Value,
  Bet14Value,
  Bet15Value,
  Bet16Value,
  Bet17Value,
  Bet18Value,
  Bet19Value,
  Bet20Value,
  Bet21Value,
  Bet22Value,
  Bet23Value,
  Bet24Value,
  Bet25Value,
  Bet26Value,
  Bet27Value,
  Bet28Value,
  Bet29Value,
  Bet30Value,
  Bet31Value,
  Bet32Value,
  Bet33Value,
  Bet34Value,
  Bet35Value,
  Bet36Value,

) => {


  try {
    // console.log("i m in ");
    let responseData = await rouletebet.find({ _id: 1 });

    if (responseData.length > 0) {
      // console.log("i m in2", Bet00)

   
      if (responseData.length > 0) {
        // console.log('in bet', responseData[0].bet34);
        const points = parseInt(straightUpVal) + parseInt(responseData[0].straightUp);
        const bpoints = parseInt(SplitVal) + parseInt(responseData[0].Split);
        const cpoints = parseInt(StreetVal) + parseInt(responseData[0].Street);
        const dpoints = parseInt(CornerVal) + parseInt(responseData[0].Corner);
        const epoints = parseInt(specificBetVal) + parseInt(responseData[0].specificBet);
        const fpoints = parseInt(lineVal) + parseInt(responseData[0].line);
        const gpoints = parseInt(dozen1Val) + parseInt(responseData[0].dozen1);
        const hpoints = parseInt(dozen2Val) + parseInt(responseData[0].dozen2);
        const ipoints = parseInt(dozen3Val) + parseInt(responseData[0].dozen3);
        const jpoints = parseInt(column1Val) + parseInt(responseData[0].column1);
        const kpoints = parseInt(column2Val) + parseInt(responseData[0].column2);
        const mpoints = parseInt(column3Val) + parseInt(responseData[0].column3);
        const npoints = parseInt(onetoEighteen) + parseInt(responseData[0].onetoEighteen);
        const opoints = parseInt(nineteentoThirtysix) + parseInt(responseData[0].nineteentoThirtysix);
        const ppoints = parseInt(odd) + parseInt(responseData[0].odd);
        const qpoints = parseInt(evenVal) + parseInt(responseData[0].even);
        const rpoints = parseInt(blackVal) + parseInt(responseData[0].black);
        const spoints = parseInt(redVal) + parseInt(responseData[0].red);
        const sumbet0 = parseInt(Bet0) + parseInt(responseData[0].bet0);
        const sumbet1 = parseInt(Bet1) + parseInt(responseData[0].bet1);
        const sumbet2 = parseInt(Bet2) + parseInt(responseData[0].bet2);
        const sumbet3 = parseInt(Bet3) + parseInt(responseData[0].bet3);
        const sumbet4 = parseInt(Bet4) + parseInt(responseData[0].bet4);

        const sumbet5 = parseInt(Bet5) + parseInt(responseData[0].bet5);
        const sumbet6 = parseInt(Bet6) + parseInt(responseData[0].bet6);
        const sumbet7 = parseInt(Bet7) + parseInt(responseData[0].bet7);
        const sumbet8 = parseInt(Bet8) + parseInt(responseData[0].bet8);
        const sumbet9 = parseInt(Bet9) + parseInt(responseData[0].bet9);
        const sumbet10 = parseInt(Bet10) + parseInt(responseData[0].bet10);
        const sumbet11 = parseInt(Bet11) + parseInt(responseData[0].bet11);
        const sumbet12 = parseInt(Bet12) + parseInt(responseData[0].bet12);
        const sumbet13 = parseInt(Bet13) + parseInt(responseData[0].bet13);
        const sumbet14 = parseInt(Bet14) + parseInt(responseData[0].bet14);

        const sumbet15 = parseInt(Bet15) + parseInt(responseData[0].bet15);
        const sumbet16 = parseInt(Bet16) + parseInt(responseData[0].bet16);
        const sumbet17 = parseInt(Bet17) + parseInt(responseData[0].bet17);
        const sumbet18 = parseInt(Bet18) + parseInt(responseData[0].bet18);
        const sumbet19 = parseInt(Bet19) + parseInt(responseData[0].bet19);
        const sumbet20 = parseInt(Bet20) + parseInt(responseData[0].bet20);
        const sumbet21 = parseInt(Bet21) + parseInt(responseData[0].bet21);
        const sumbet22 = parseInt(Bet22) + parseInt(responseData[0].bet22);
        const sumbet23 = parseInt(Bet23) + parseInt(responseData[0].bet23);
        const sumbet24 = parseInt(Bet24) + parseInt(responseData[0].bet24);

        const sumbet25 = parseInt(Bet25) + parseInt(responseData[0].bet25);
        const sumbet26 = parseInt(Bet26) + parseInt(responseData[0].bet26);
        const sumbet27 = parseInt(Bet27) + parseInt(responseData[0].bet27);
        const sumbet28 = parseInt(Bet28) + parseInt(responseData[0].bet28);
        const sumbet29 = parseInt(Bet29) + parseInt(responseData[0].bet29);
        const sumbet30 = parseInt(Bet30) + parseInt(responseData[0].bet30);
        const sumbet31 = parseInt(Bet31) + parseInt(responseData[0].bet31);
        const sumbet32 = parseInt(Bet32) + parseInt(responseData[0].bet32);
        const sumbet33 = parseInt(Bet33) + parseInt(responseData[0].bet33);
        const sumbet34 = parseInt(Bet34) + parseInt(responseData[0].bet34);

        const sumbet35 = parseInt(Bet35) + parseInt(responseData[0].bet35);
        const sumbet36 = parseInt(Bet36) + parseInt(responseData[0].bet36);
        const sumbet00 = parseInt(Bet00) + parseInt(responseData[0].bet00);


        const sumbet00Value = parseInt(Bet00Value) + parseInt(responseData[0].bet00Value);
        const sumbet0Value = parseInt(Bet0Value) + parseInt(responseData[0].bet0Value);
        const sumbet1Value = parseInt(Bet1Value) + parseInt(responseData[0].bet1Value);
        const sumbet2Value = parseInt(Bet2Value) + parseInt(responseData[0].bet2Value);
        const sumbet3Value = parseInt(Bet3Value) + parseInt(responseData[0].bet3Value);
        const sumbet4Value = parseInt(Bet4Value) + parseInt(responseData[0].bet4Value);
        const sumbet5Value = parseInt(Bet5Value) + parseInt(responseData[0].bet5Value);
        const sumbet6Value = parseInt(Bet6Value) + parseInt(responseData[0].bet6Value);
        const sumbet7Value = parseInt(Bet7Value) + parseInt(responseData[0].bet7Value);
        const sumbet8Value = parseInt(Bet8Value) + parseInt(responseData[0].bet8Value);
        const sumbet9Value = parseInt(Bet9Value) + parseInt(responseData[0].bet9Value);
        const sumbet10Value = parseInt(Bet10Value) + parseInt(responseData[0].bet10Value);
        const sumbet11Value = parseInt(Bet11Value) + parseInt(responseData[0].bet11Value);
        const sumbet12Value = parseInt(Bet12Value) + parseInt(responseData[0].bet12Value);
        const sumbet13Value = parseInt(Bet13Value) + parseInt(responseData[0].bet13Value);
        const sumbet14Value = parseInt(Bet14Value) + parseInt(responseData[0].bet14Value);
        const sumbet15Value = parseInt(Bet15Value) + parseInt(responseData[0].bet15Value);
        const sumbet16Value = parseInt(Bet16Value) + parseInt(responseData[0].bet16Value);
        const sumbet17Value = parseInt(Bet17Value) + parseInt(responseData[0].bet17Value);
        const sumbet18Value = parseInt(Bet18Value) + parseInt(responseData[0].bet18Value);
        const sumbet19Value = parseInt(Bet19Value) + parseInt(responseData[0].bet19Value);
        const sumbet20Value = parseInt(Bet20Value) + parseInt(responseData[0].bet20Value);
        const sumbet21Value = parseInt(Bet21Value) + parseInt(responseData[0].bet21Value);
        const sumbet22Value = parseInt(Bet22Value) + parseInt(responseData[0].bet22Value);
        const sumbet23Value = parseInt(Bet23Value) + parseInt(responseData[0].bet23Value);
        const sumbet24Value = parseInt(Bet24Value) + parseInt(responseData[0].bet24Value);
        const sumbet25Value = parseInt(Bet25Value) + parseInt(responseData[0].bet25Value);
        const sumbet26Value = parseInt(Bet26Value) + parseInt(responseData[0].bet26Value);
        const sumbet27Value = parseInt(Bet27Value) + parseInt(responseData[0].bet27Value);
        const sumbet28Value = parseInt(Bet28Value) + parseInt(responseData[0].bet28Value);
        const sumbet29Value = parseInt(Bet29Value) + parseInt(responseData[0].bet29Value);
        const sumbet30Value = parseInt(Bet30Value) + parseInt(responseData[0].bet30Value);
        const sumbet31Value = parseInt(Bet31Value) + parseInt(responseData[0].bet31Value);
        const sumbet32Value = parseInt(Bet32Value) + parseInt(responseData[0].bet32Value);
        const sumbet33Value = parseInt(Bet33Value) + parseInt(responseData[0].bet33Value);
        const sumbet34Value = parseInt(Bet34Value) + parseInt(responseData[0].bet34Value);
        const sumbet35Value = parseInt(Bet35Value) + parseInt(responseData[0].bet35Value);
        const sumbet36Value = parseInt(Bet36Value) + parseInt(responseData[0].bet36Value);







        let formData = {
          straightUp: points,
          Split: bpoints,
          Street: cpoints,
          Corner: dpoints,
          specificBet: epoints,
          line: fpoints,
          dozen1: gpoints,
          dozen2: hpoints,
          dozen3: ipoints,
          column1: jpoints,
          column2: kpoints,
          column3: mpoints,
          onetoEighteen: npoints,
          nineteentoThirtysix: opoints,
          even: ppoints,
          odd: qpoints,
          black: rpoints,
          red: spoints,
          bet00: sumbet00,
          bet0: sumbet0,
          bet1: sumbet1,
          bet2: sumbet2,
          bet3: sumbet3,
          bet4: sumbet4,
          bet5: sumbet5,
          bet6: sumbet6,
          bet7: sumbet7,
          bet8: sumbet8,
          bet9: sumbet9,
          bet10: sumbet10,
          bet11: sumbet11,
          bet12: sumbet12,
          bet13: sumbet13,
          bet14: sumbet14,
          bet15: sumbet15,
          bet16: sumbet16,
          bet17: sumbet17,
          bet18: sumbet18,
          bet19: sumbet19,
          bet20: sumbet20,
          bet21: sumbet21,
          bet22: sumbet22,
          bet23: sumbet23,
          bet24: sumbet24,
          bet25: sumbet25,
          bet26: sumbet26,
          bet27: sumbet27,
          bet28: sumbet28,
          bet29: sumbet29,
          bet30: sumbet30,
          bet31: sumbet31,
          bet32: sumbet32,
          bet33: sumbet33,
          bet34: sumbet34,
          bet35: sumbet35,
          bet36: sumbet36,

          bet00Value: sumbet00Value,
          bet0Value: sumbet0Value,
          bet1Value: sumbet1Value,
          bet2Value: sumbet2Value,
          bet3Value: sumbet3Value,
          bet4Value: sumbet4Value,
          bet5Value: sumbet5Value,
          bet6Value: sumbet6Value,
          bet7Value: sumbet7Value,
          bet8Value: sumbet8Value,
          bet9Value: sumbet9Value,
          bet10Value: sumbet10Value,
          bet11Value: sumbet11Value,
          bet12Value: sumbet12Value,
          bet13Value: sumbet13Value,
          bet14Value: sumbet14Value,
          bet15Value: sumbet15Value,
          bet16Value: sumbet16Value,
          bet17Value: sumbet17Value,
          bet18Value: sumbet18Value,
          bet19Value: sumbet19Value,
          bet20Value: sumbet20Value,
          bet21Value: sumbet21Value,
          bet22Value: sumbet22Value,
          bet23Value: sumbet23Value,
          bet24Value: sumbet24Value,
          bet25Value: sumbet25Value,
          bet26Value: sumbet26Value,
          bet27Value: sumbet27Value,
          bet28Value: sumbet28Value,
          bet29Value: sumbet29Value,
          bet30Value: sumbet30Value,
          bet31Value: sumbet31Value,
          bet32Value: sumbet32Value,
          bet33Value: sumbet33Value,
          bet34Value: sumbet34Value,
          bet35Value: sumbet35Value,
          bet36Value: sumbet36Value,




        };
      // console.log('-sumbet00Value->',sumbet00Value,'Bet00Value->', Bet00Value,'responseData[0].bet00Value->',responseData[0].bet00Value )
      const userss =  await rouletebet.updateOne({ _id: 1 }, formData);
        // console.log('RouletteBets-updateOne--------bet ---------',formData);
        
      }
    } else {
    }
  } catch (err) {
    console.log(err);
  }
};







const RemoveAllplayer = async () => {
  try {
   
    let userss = await isbetplacedroulette.deleteMany({});

    // // console.log(userss);
  } catch (err) {
    console.log(err);
  }
};


const GetGameHistoryGameRunningData = async () => {
  try {
     
    let responseData = await game_running_roulette.find({}).sort({ playedTime: -1 }).limit(6).lean();

    if (responseData.length > 0) {

      return responseData

    }
    return "no user data exits"
  } catch (err) {
    // // console.log("err",err)
    console.log(err);

  }
};


const PlayerDetails = async (
  playername,
  RoundCount,
  winNo
) => {
  try {
     console.error("PlayerDetails-rollet");

    var formData1 = {
      playername: playername,
      RoundCount: RoundCount,

      winNo: winNo,
    };
    // let sql = `SELECT * FROM roulette_playerdetails WHERE playername = ? `;
    // let responseData = await db.query(sql, playername);
    /*   if (responseData.length > 0) {
            sql = "UPDATE game_running SET singleNo=?,doubleNo=?,tripleNo=?,Win_singleNo=? WHERE playername =? ";
    
            const userss = await db.query(sql,  [singleNo,doubleNo,tripleNo,Win_singleNo ,playername]);
                
            // // console.log(userss);;
             }
         */ // else {
    // sql = "INSERT INTO  roulette_playerdetails SET ?";
    // const users = await db.query(sql, formData1);
   // let users = await roulette_playerdetails.create(formData1);

    if (users) {
    }
    return "successfully";
  } catch (err) {
    // // console.log("err", err);
    console.log(err);
  }
};


const getAdminroulette = async () => {

  try {

    
    let updateResponse = await admin_roulette.findOne({ _id: 1 }).lean();

    if (updateResponse) {
      return updateResponse;
    } else {
      return false
    }

  } catch (error) {
    // // console.log("error",error)
    //  // console.log(error);

  }
};
const WinamountDetails = async (playerId, game_id, point) => {
  await AppService.WinamountDetails(playerId, game_id, point)

};
const GetAllplayer = async () => {
  try {
     
    let userss = await isbetplacedroulette.find({}).lean();

    // // console.log(userss);
    return userss;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  GetAllplayer,

  WinamountDetails,
  getAdminroulette,
  PlayerDetails,
  GetGameHistoryGameRunningData,
  RemoveAllplayer,
  RouletteBets,

  AddPlayerIdInBetplaced,
  onbalance,
  RemovePlayerIdInBetplaced,
  RemoveRouletteBetsAll,
  UpdateGameRunningDataWinSingleNumber,
  Detailroulete, DetailrouleteValue,
  UpdateGameRunningDataWinpoint,
  GetPlayerIdInBetplaced,
  GetGameRunningData,
  GameRunning,
  JoinGame,
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
