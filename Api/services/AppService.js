const debug = require("debug")("test");
const Users = require("../models/users");
const winpoint_details = require("../models/winpoint_details");
const Transfer_record = require("../models/transfer_record");
const Trandableapi = require("../models/trandableapi");
const daily_report = require("../models/daily_report");


const changeStatus = async (status, playerId) => {
  try {
    let changeStatus = await Users.updateOne({ id: playerId }, { is_login: status });
    return;
  } catch (err) {
    console.log(err);
  }
}

const userByEmail = (email) => {
  return Users.findOne({ email }).lean();

};
const addPointByEmail = (email, point) => {
  return Users.findOneAndUpdate({ email }, { $inc: { 'point': point } }, {
    new: true
  }).lean();
};
const addCash_balance = (email, point) => {
  return Users.findOneAndUpdate({ email }, { $inc: { 'cash_balance': point } }, {
    new: true
  }).lean();
};
const WinamountDetails = async (playerId, game_id, point) => {
  try {
    var formData1 = {
      playerId: playerId,
      game_id: game_id,
      point: point,
    };
     
     await winpoint_details.findOneAndUpdate({ playerId, game_id }, { $inc: { 'point': point } }, { upsert: true });
     
      return "successfully";
    
  } catch (err) {
    // console.log("err", err);
    //  console.log(err);
  }
};

const WinamountDetailDel = async (id) => {
  return await winpoint_details.findByIdAndDelete(id);
}
const transfer_record = async (FromAccountName, ToAccountName, point, role_id, type = 'P') => {
  return await Transfer_record.create({ FromAccountName, ToAccountName, point, type, role_id });
}
const recive_list = (playerId) => {

  return Trandableapi.find({ $or: [{ ToAccountName: playerId, status: 'P' }, { FromAccountName: playerId, status: 'R' }] }).lean();;
}
const transfer_list = async (emailId) => {
  let agent = await Trandableapi.find({ FromAccountName: emailId, status: "P" }).lean();
  let message = "success";
  let data1 = { message, transferRecord: [] };

  if (agent.length > 0) {
    let transferRecordArray = [];

    for (let i = 0; i < agent.length; i++) {
      // ✅ Skip creating entry if transfer is to admin
      if (agent[i].ToAccountName === "admin@admin.com") {
        // point already deducted in DB, just no entry in transferRecord
        continue;
      }

      let transferRecord = {
        _id: agent[i]._id,
        from: agent[i].FromAccountName,
        to: agent[i].ToAccountName,
        amount: agent[i].point,
        status: agent[i].status,
        date: agent[i].createdAt,
      };

      transferRecordArray.push(transferRecord);
    }

    data1.transferRecord = transferRecordArray;
  }

  return data1;
};


const accept_point = async (notifyId, playerId) => {
  let savePoint = await Trandableapi.findOne({ _id: notifyId }).lean();
  if (!savePoint) {
    return false;
  }
  let point = savePoint['point'];
  let role_id, from, to, type = 'P';
  let logrec;

  if (savePoint.status == 'P' && playerId == savePoint['ToAccountName']) {
    playerId = savePoint['ToAccountName'];
    from = await Users.findOne({ email: savePoint['FromAccountName'] }).select({ role_id: 1 }).lean();
    to = await Users.findOne({ email: savePoint['ToAccountName'] }).select({ role_id: 1 }).lean();
    if (from.role_id > to.role_id) {
      type = 'G';
    }

    
    role_id = from.role_id;
    await addPointByEmail(playerId, point);

    await Transfer_record.create({
      'FromAccountName': savePoint.FromAccountName,
      'ToAccountName': savePoint.ToAccountName,
      'point': savePoint.point,
      'role_id': role_id,
      'type': type

    });
  } else if (savePoint.status == 'R' && playerId == savePoint['FromAccountName']) {
    playerId = savePoint['FromAccountName'];
   let  user = await addPointByEmail(playerId, point);
    role_id = user.role_id;
  } else {
    return false;
  }


  await Trandableapi.findByIdAndDelete(notifyId);

  return true;
}
const reject_point = async (notifyId, playerId) => {

  let reciveableData = await Trandableapi.findOne({ _id: notifyId, status: 'P', 'ToAccountName': playerId })
  if (reciveableData) {
    await Trandableapi.findByIdAndUpdate(notifyId, { 'status': 'R' });
    return true;
  } else {
    return false;
  }
}
const cancle_point = async (id, playerId) => {
  let message;
  let statusCode;
 let responseData = await Trandableapi.findOne({ _id: id, 'FromAccountName': playerId, status: 'P' });
  if (responseData) {
    let fromAccountName = responseData.FromAccountName;
    const points = parseInt(responseData.point);

   let updateResponse = await addPointByEmail(fromAccountName, points)
    await Trandableapi.findByIdAndDelete(id);
    statusCode = 200;
    message = "Points rejected and returned successfully. Record stored in rejectedpoint_record.";

  } else {
    message = "Points not Cancled.";
  }

  return message;
}
const transfer_request = async (sender, receive, point, pin) => {
  let message = ''; let status = 400;

  let formData1 = { ToAccountName: receive, FromAccountName: sender, point: point, status: 'P' };
  let senderData = await userByEmail(sender);
  if (!senderData) {
    throw new Error('Sender Not Found.');

  }
  if (receive === senderData.idManager) {
    //allow parent transfer 
  } else {
    //check child and allow tranfer 
    let reciverData = await Users.findOne({ email: receive, idManager: sender });
    if (!reciverData) {
      throw new Error('Transfer  not allowed.');
    }
  }
  if (senderData.point < point) {
    message = "Point Balance Low"
  } else if (senderData.password !== pin) {
    message = "Wrong Pin";
  } else {
    let userss = await Trandableapi.create(formData1);

    if (userss) {
      await addPointByEmail(sender, -point);
      status = 200;
      message = "Points updated";

    } else {
      message = "Request not Loged"
    }
  }
  return { message, status };
}

const dailyReport = async (user_email, idManager, betAmount, winAmount) => {
  const dateString = new Date().toISOString().split('T')[0]; // Get current date in "YYYY-MM-DD" format

  await daily_report.findOneAndUpdate(
    { user_email, day: dateString, idManager },
    { $inc: { agent_profit:  betAmount - winAmount , user_profit: winAmount-betAmount} },
    { upsert: true }
  );

}
module.exports = {
  dailyReport, transfer_request, cancle_point, transfer_list, reject_point, accept_point, transfer_record, recive_list,
  changeStatus, userByEmail, addPointByEmail, addCash_balance, WinamountDetails, WinamountDetailDel
};