const bcrypt = require("bcrypt");
//const check = require('../validation/CheckValidation')
const debug = require("debug")("test");
const asyncHandler = require('../middleware/async');
const conn = require("../config/db");
const AppService = require("../services/AppService");
const Users = require("../models/users");
const Trandableapi = require("../models/trandableapi");
const Receivableapi = require("../models/receivableapi");
const CanceledPoint_record = require("../models/canceledPoint_record");
const Transfer_record = require("../models/transfer_record");
const Rejectedpoint_record = require("../models/rejectedpoint_record");

const Admin_triplechance = require("../models/admin_triplechance");
const Admin_roulette = require("../models/admin_roulette");
const Admin_andarbahar = require("../models/admin_andarbahar");
const Admin_7up = require("../models/admin_7up");
const Admin_funtarget = require("../models/admin_funtarget");

const Game_runningfuntarget = require("../models/game_runningfuntarget");
const Game_running_andarbahar = require("../models/game_running_andarbahar");
const Game_running_roulette = require("../models/game_running_roulette");
const Game_running_avaitor = require("../models/game_running_avaitor");

const cron = require("node-cron");













//const Roulette_playerdetails = require("../models/roulette_playerdetails");
//const Funtarget_playerdetail = require("../models/funtarget_playerdetail");

const Rouletebet = require("../models/rouletebet");
const Triplechance_bet = require("../models/triplechance_bet");
const Winpoint_details = require("../models/winpoint_details");

const Point_history = require("../models/point_history");
const Join_game = require("../models/join_game");
const Pointtransferred = require("../models/pointtransferred");
const Pointreject = require("../models/pointreject");
const Pointcanel = require("../models/pointcanel");

const RouletteService = require("../services/RouletteService");
const FunTargetService = require("../services/FunTargetService");
const version = require("../models/versions");


const moment = require("moment");
//const {authToken} =require('../middleware/getToken')
// User login
var nodemailer = require("nodemailer");
const daily_report = require("../models/daily_report");

//list of getPlayerDAta
const getPass = async (req, res) => {
  var val = Math.floor(1000 + Math.random() * 9000);
  // console.log("allusersValue:", val);
  res.send({
    statusCode: 200,
    message: "password generated",
    password: val,
  });
};

const getPlayerData = async (req, res) => {
  let message = null;
  let statusCode = 201;
  try {
    let empty = { "data": [], "recordsTotal": 0, "recordsFiltered": 0, "draw": req.body.draw };
    let filter = {
      limit: req.body.size,
      skip: (req.body.page - 1) * req.body.size,
      find: {},
      select: { email: 1, idManager: 1, point: 1, role_id: 1 },
      search: {},
      sort: { _id: -1 }
    };

    let key = req.body.search ? req.body.search.value : '';

    if (req.body.role) {
      filter['find']['role_id'] = req.body.role;
    }

    // If searching
    if (key) {
      // Uncomment if needed:
      // let player = await Player.findOne({ $or: [{ 'email': { '$regex': key, '$options': 'i' } }, { phone: { '$regex': key, '$options': 'i' } }] });
      // if (!player) {
      //   return res.json(empty);
      // }
      // filter['find']['playerId'] = player._id;
    }

    // Fetch users via datatables
    Users.dataTables(filter).then(async function (table) {
      let userIds = table.data.map(u => u._id);

      // Aggregate bets/wins for these users
      const betWinStats = await Game_runningfuntarget.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: "$userId",
            totalBet: { $sum: "$betpoint" },
            totalWin: { $sum: "$winpoint" }
          }
        }
      ]);

      // Convert aggregation to lookup map
      let statsMap = {};
      betWinStats.forEach(stat => {
        statsMap[stat._id.toString()] = {
          totalBet: stat.totalBet,
          totalWin: stat.totalWin,
          profitLoss: stat.totalBet - stat.totalWin
        };
      });

      // Attach stats to user list
      let enrichedData = table.data.map(user => {
        let stats = statsMap[user._id.toString()] || { totalBet: 0, totalWin: 0, profitLoss: 0 };
        return {
          ...user.toObject(),
          totalBet: stats.totalBet,
          totalWin: stats.totalWin,
          profitLoss: stats.profitLoss
        };
      });

      const responseData = {
        status: statusCode,
        data: enrichedData,
        recordsTotal: table.total,
        message,
      };
      res.send(responseData);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
};


let getDataTable = async (table, req, customFilter = {}) => {
  let empty = { "data": [], "recordsTotal": 0, "recordsFiltered": 0, "draw": req.body.draw };
  let filter = {
    limit: req.body.size || 20,
    skip: (req.body.page - 1) * req.body.size || 0,
    find: {},
    select: {},
    search: {},
    sort: { _id: -1 },
    ...customFilter // Merge customFilter with the default filter
  };



  // Add other conditions based on your requirements
  let status = 200;
  let message = 'Record Not Found';
  try {
    const dataTable = await table.dataTables(filter);
    const responseData = {
      status: 200, // You need to define statusCode somewhere
      data: dataTable.data,
      recordsTotal: dataTable.total,
      message: ''
    };
    return responseData;
  } catch (error) {
    console.error("Error fetching data table:", error);
    return empty;
  }
}



const getPlayerIdData = async (req, res) => {
  var playerid = "";
  const sql2 = `SELECT COUNT(*) as totalcount  FROM users`;
  const allusers = await conn.query(sql2);
  // console.log("allusers:", allusers[0].totalcount);
  if (allusers[0].totalcount >= 0 && allusers[0].totalcount <= 9) {
    //playerid = "GK0000" + allusers[0].totalcount;
    playerid = "GK0010000" + allusers[0].totalcount;
  } else if (
    allusers[0].totalcount / 10 >= 1 &&
    allusers[0].totalcount / 10 <= 9
  ) {
    //playerid = "GK000" + allusers[0].totalcount;
    playerid = "GK001000" + allusers[0].totalcount;
  } else if (
    allusers[0].totalcount / 10 >= 10 &&
    allusers[0].totalcount / 10 <= 99
  ) {
    //playerid = "GK00" + allusers[0].totalcount;
    playerid = "GK00100" + allusers[0].totalcount;
  } else if (
    allusers[0].totalcount / 10 >= 100 &&
    allusers[0].totalcount / 10 <= 999
  ) {
    // playerid = "GK0" + allusers[0].totalcount;
    playerid = "GK0010" + allusers[0].totalcount;
  } else if (
    allusers[0].totalcount / 10 >= 1000 &&
    allusers[0].totalcount / 10 <= 9999
  ) {
    // playerid = "GK" + allusers[0].totalcount;
    playerid = "GK001" + allusers[0].totalcount;
  }
  // console.log("playerId", playerid);
  statusCode = 200;
  message = "success";
  data = playerid;

  const responseData = {
    status: statusCode,
    message,
    data,
  };
  res.send(responseData);
};

//list of Super Master
const getSuperMasterData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    let sql = `SELECT * FROM  supermaster`;
    const agent = await conn.query(sql);
    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

//MasterId

const getMasterIdData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    let sql = `SELECT * FROM  masterid`;
    const agent = await conn.query(sql);
    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const getPlayerHistoryData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    let sql = `SELECT user.id,user.user_id,user.username,game_name.game_name FROM  user left join round_report on user.user_id=round_report.player_id left join game_name on round_report.game=game_name.id`;
    const agent = await conn.query(sql);
    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};
const AndarBaharGamePlayHistoryData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    //let sql = `SELECT * FROM game_record_andarbhar ORDER BY created DESC  `;
    // let sql = `SELECT * FROM andarbahar_playerdetails ORDER BY playedtime DESC  `;
    // const agent = await conn.query(sql);
    //let agent = Andarbahar_playerdetails.find({}).sort({ playedtime: -1 });

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const RoulletGamePlayHistoryData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    //let sql = `SELECT * FROM game_record_roulette ORDER BY created DESC`;

    // let sql = `SELECT * FROM roulette_playerdetails ORDER BY playedtime DESC  `;
    // const agent = await conn.query(sql);
    //let data = await Roulette_playerdetails.find({}).sort({ playedtime: -1 });

    if (data.length > 0) {
      statusCode = 200;
      message = "success";
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log(error)
    res.status(500).send("Database error");
  }
};
const FunTargetGamePlayHistoryData = async (req, res) => {
  let message = "Record not found";
  let statusCode = 400;
  try {
    //let sql = `SELECT * FROM game_record_funtarget ORDER BY created DESC `;

    // let sql = `SELECT * FROM funtarget_playerdetail ORDER BY playedtime DESC  `;
    // const agent = await conn.query(sql);
    let find = {

    };
    let select = {};
    let data = await getDataTable(Funtarget_playerdetail, req, { find, select });
    console.log(data,"wkdnjd...............................---------------------------------");
    res.send(data);
  } catch (error) {
    console.log(error)
    res.status(500).send("Database error");
  }
};
const TripleChanceGamePlayHistoryData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT * FROM game_record_triplechance ORDER BY created DESC`;

    // let sql = `SELECT * FROM triplechance_playerdetail ORDER BY playedtime DESC  `;
    // const agent = await conn.query(sql);
    let agent = Triplechance_playerdetail.find({}).sort({ playedtime: -1 });

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const SevenUpGamePlayHistoryData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    //let sql = `SELECT * FROM game_record_sevenup ORDER BY created DESC`;

    // let sql = `SELECT * FROM seven_playerdetail ORDER BY playedtime DESC  `;
    // const agent = await conn.query(sql);
    // let agent = Seven_playerdetail.find({}).sort({ playedtime: -1 });

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};
const Transaction = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT * FROM transactions ORDER BY created DESC`;
    // const agent = await conn.query(sql);
    let agent = Transactions.find({}).sort({ created: -1 });

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const PointTransfer = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT * FROM pointtransferred `;
    // const agent = await conn.query(sql);
    let agent = Pointtransferred.find({});



    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const PointReceive = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let data;
  try {
    // let sql = `SELECT * FROM pointtransferred `;
    // const agent = await conn.query(sql);
    let agent = Pointtransferred.find({});

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log(error)
    res.status(500).send("Database error");
  }
};

const PointCancel = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let data;

  // let sql = `SELECT * FROM pointcanel `;
  // const agent = await conn.query(sql);
  let r = await getDataTable(Pointcanel, req);
  res.send(r);

};

const PointRejected = async (req, res) => {
  // let sql = `SELECT * FROM pointreject `;
  // const agent = await conn.query(sql);

  let r = await getDataTable(Pointreject, req);
  res.send(r);
};
const PointHistory = async (req, res) => {

  const { ToUser, s_date, e_date, email, type, role_id } = req.body;

  // Formatating fromDate and toDate 
  // const formattedFromDate = moment(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  // const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');

  let find = {}
  if (req.user.role_id == 5) {
    if (type == 'send') {
      find = {
        FromAccountName: email,
      };
    } else if (type == 'receive') {
      find = {
        ToAccountName: email
      };
    }

  } else if (req.user.role_id == 4) {
    if (type == 'send') {
      find = {
        FromAccountName: email,
        // Date: { $gte: formattedFromDate, $lte: formattedToDate }
      };
    } else if (type == 'receive') {
      find = {
        ToAccountName: email, role_id: { $lt: 4 }
        // Date: { $gte: formattedFromDate, $lte: formattedToDate }

      };
    }
  } else if (req.user.role_id == 0) {
    if (email) {
      if (type == '') {
        find = {
          $or: [{ FromAccountName: email }, { ToAccountName: email }]
        };
      } else if (type == 'send') {
        find = {
          FromAccountName: email,
          // Date: { $gte: formattedFromDate, $lte: formattedToDate }
        };
      } else if (type == 'receive') {
        find = {
          ToAccountName: email, role_id: { $lt: 4 }
          // Date: { $gte: formattedFromDate, $lte: formattedToDate }

        };
      }

    }

  }
c

  if (s_date && e_date) {
    find['Date'] = { $gte: s_date, $lte: e_date }
  }

  //let select = { FromAccountName: 1, ToAccountName: 1, Amount: 1, CancellationDate: 1 };

  let r = await getDataTable(Transfer_record, req, { find });
  console.log(r,"----------------------rrrrr-----------------");
  res.send(r);
};

const GameReport = async (req, res) => {

  let r = await getDataTable(Winpoint_details, req);
  res.send(r);
};

const DailyStatus = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {

    let agent = await Daily_status.find({});

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

//Playerpointhistory
const getPlayerPointHistory = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT user.id,user.user_id,user.username,game_record_dragon.game_id,game_record_dragon.created_at FROM user left join game_record_dragon on user.user_id=game_record_dragon.user_id`;
    // const agent = await conn.query(sql);
    const pipeline = [
      {
        $lookup: {
          from: 'game_record_dragon',
          localField: 'user_id',
          foreignField: 'user_id',
          as: 'game_records'
        }
      },
      {
        $project: {
          _id: 0,
          id: '$user.id',
          user_id: '$user.user_id',
          username: '$user.username',
          game_id: '$game_records.game_id',
          created_at: '$game_records.created_at'
        }
      }
    ];

    const agent = await Users.aggregate(pipeline);
    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agenot found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

/* //GamesHistory------------------
const getDoubleChanceHistory= async (req, res) => {
    let message = null
    let statusCode = 400  
    let data;
    try { 
           // let sql = `SELECT * FROM round_report WHERE game=1 and outer_win=NULL and inner_win=NULL `;
           let sql = `SELECT * FROM round_report WHERE game=1 `;

            const agent = await conn.query(sql)
            if(agent.length>0){ 
                statusCode = 200
                message    = "success" 
                data = agent
            }else{
                statusCode = 400
                message    = "NOT found"
            } 
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
     
    } catch (error) {
        res.status(500).send('Database error 1')
    }
}
const getJeetoJokerHistory= async (req, res) => {
    let message = null
    let statusCode = 400  
    try { 
            let sql = `SELECT * FROM round_report WHERE game=2 `;
            const agent = await conn.query(sql)
            if(agent.length>0){ 
                statusCode = 200
                message    = "success" 
                data = agent
            }else{
                statusCode = 400
                message    = "Agent found"
            } 
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
     
    } catch (error) {
        res.status(500).send('Database error 1')
    }
}
const get16CardsHistory= async (req, res) => {
    let message = null
    let statusCode = 400  
    try { 
            let sql = `SELECT * FROM round_report WHERE game=3`;
            const agent = await conn.query(sql)
            if(agent.length>0){ 
                statusCode = 200
                message    = "success" 
                data = agent
            }else{
                statusCode = 400
                message    = "Agent found"
            } 
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
     
    } catch (error) {
        res.status(500).send('Database error 1')
    }
}
const getSpinGameHistory= async (req, res) => {
    let message = null
    let statusCode = 400  
    try { 
            let sql = `SELECT * FROM round_report WHERE game=4 `;
            const agent = await conn.query(sql)
            if(agent.length>0){ 
                statusCode = 200
                message    = "success" 
                data = agent
            }else{
                statusCode = 400
                message    = "Agent found"
            } 
            const responseData = {
                status: statusCode,
                message, 
                data
            }
            res.send(responseData)
     
    } catch (error) {
        res.status(500).send('Database error 1')
    }
}

 */

const sendPoints = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  try {
    // console.log(req.body, "Send data");
    const { role_id, user_id, distributor_id, stokez_id, points, passcode } =
      req.body;
    switch (role_id) {
      case 4:
        sql = `SELECT * FROM stokez WHERE LOWER(id)= ? limit ?`;
        responseData = await conn.query(sql, [stokez_id, 1]);
        if (responseData.length > 0) {
          sql = `SELECT * FROM stokez_point WHERE LOWER(stokez_id)= ? limit ?`;
          responseData = await conn.query(sql, [stokez_id, 1]);
          if (responseData.length > 0) {
            const tpoints = parseInt(points) + parseInt(responseData[0].point);
            sql = "UPDATE stokez_point SET point= ? WHERE stokez_id=?";
            const userss = await conn.query(sql, [tpoints, stokez_id]);
            if (userss) {
              let formData = {
                stokez_id: stokez_id,
                point: points,
              };
              sql = "INSERT INTO  stokez_point_history SET ?";
              const userss = await conn.query(sql, formData);
              statusCode = 200;
              message = "Points updated";
            } else {
              statusCode = 500;
              message = "Something went wrong! database error";
            }
          } else {
            let formData = {
              stokez_id: stokez_id,
              point: points,
            };
            sql = "INSERT INTO  stokez_point SET ?";
            const userss = await conn.query(sql, formData);
            if (userss) {
              statusCode = 200;
              message = "Points updated";
            } else {
              statusCode = 500;
              message = "Something went wrong! database error";
            }
          }
        } else {
          message = "Invalid stokez id";
          statusCode = 400;
        }
        break;
      case 2:
        break;
      case 3:
        break;

      default:
        break;
    }

    const responseData = {
      status: statusCode,
      message,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

//transfer  stokez point
const sendPointstoSuperMaster = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { id, points } = req.body;
    // console.log(id, points);

    let formData = {
      id: id,
      point: points,
    };
    let formData1 = {
      receiver: id,
      sender: "Company",
      point: points,
    };

    if (points) {
      sql = `SELECT * FROM supermaster WHERE full_name = ? limit ?`;
      responseData = await conn.query(sql, [id, 1]);
      if (responseData.length > 0) {
        // console.log(responseData, "responseData");
        statusCode = 400;
        let stokezPointId = responseData[0].id;
        const tpoints = parseInt(points) + parseInt(responseData[0].point);

        sql = "UPDATE supermaster SET ? WHERE full_name=?";
        updateResponse = await conn.query(sql, [{ point: tpoints }, id]);
        if (updateResponse) {
          // statusCode = 200
          // message    = "Points updated"

          sql = "INSERT INTO  point_history SET ?";
          const userss = await conn.query(sql, formData1);
          if (userss) {
            statusCode = 200;
            message = "Points updated";
          } else {
            statusCode = 500;
            message = "Something went wrong! database error";
          }
        } else {
          statusCode = 500;
          message = "Something went wrong! database error";
        }
      }
    } else {
      statusCode = 400;
      message = "Points required";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log(error);

    res.status(500).send("Database error");
  }
};

//transfer agent point
const sendPointstoMasterId = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { id, points } = req.body;
    // console.log(id, points);

    let formData = {
      id: id,
      point: points,
    };
    let formData1 = {
      receiver: id,
      sender: "Company",
      point: points,
    };

    if (points) {
      sql = `SELECT * FROM masterid WHERE full_name = ? limit ?`;
      responseData = await conn.query(sql, [id, 1]);
      if (responseData.length > 0) {
        // console.log(responseData, "responseData");
        statusCode = 400;
        let stokezPointId = responseData[0].id;
        const tpoints = parseInt(points) + parseInt(responseData[0].point);

        sql = "UPDATE masterid SET ? WHERE full_name=?";
        updateResponse = await conn.query(sql, [{ point: tpoints }, id]);
        if (updateResponse) {
          //statusCode = 200
          //message    = "Points updated"
          sql = "INSERT INTO  point_history SET ?";
          const userss = await conn.query(sql, formData1);
          if (userss) {
            statusCode = 200;
            message = "Points updated";
          } else {
            statusCode = 500;
            message = "Something went wrong! database error";
          }
        } else {
          statusCode = 500;
          message = "Something went wrong! database error";
        }
      }
    } else {
      statusCode = 400;
      message = "Points required";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
};
//transfer player point
const sendPointstoPlayer = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { id, points } = req.body;

    let formData = {
      id: id,
      point: points,
    };
    let formData1 = {
      receiver: id,
      sender: "Company",
      point: points,
    };

    if (points) {
      sql = `SELECT * FROM users WHERE email = ? limit ?`;
      responseData = await conn.query(sql, [id, 1]);
      if (responseData.length > 0) {
        console.log(responseData, "responseData");
        statusCode = 400;
        let stokezPointId = responseData[0].id;
        const tpoints = parseInt(points) + parseInt(responseData[0].point);

        sql = "UPDATE users SET ? WHERE email=?";
        updateResponse = await conn.query(sql, [{ point: tpoints }, id]);
        if (updateResponse) {
          //statusCode = 200
          // message    = "Points updated"
          sql = "INSERT INTO  point_history SET ?";
          const userss = await conn.query(sql, formData1);
          if (userss) {
            statusCode = 200;
            message = "Points updated";
          } else {
            statusCode = 500;
            message = "Something went wrong! database error";
          }
        } else {
          statusCode = 500;
          message = "Something went wrong! database error";
        }
      }
    } else {
      statusCode = 400;
      message = "Points required";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const changePercentage = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { slots, userpoints, adminpoints } = req.body;

    let formData = {
      name: slots,
      percentage: adminpoints,
    };

    if (adminpoints) {
      sql = "UPDATE usershareprofit SET ? WHERE name=?";
      updateResponse = await conn.query(sql, [formData, slots]);
      if (updateResponse) {
        statusCode = 200;
        message = " Profit Points updated";
      } else {
        statusCode = 500;
        message = "Something went wrong! database error";
      }
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const UserShare = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    let sql = `SELECT * FROM usershareprofit `;
    const agent = await conn.query(sql);
    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "Agent not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};
//front-end
const transferPoint = async (req, res) => {
  let message = null;
  let statusCode = 200;
  var data = {};
  const { emailId } = req.body;
  try {
    data = await AppService.transfer_list(emailId);
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log(error)
    res.status(500).send("Database error");
  }
};
const onbalance = async (req, res) => {
  let message = null;
  let statusCode = 400;
  const email = req.body.email;
  let data;
  try {
    // let sql = `SELECT point FROM users where email =? `;
    // const agent = await conn.query(sql, email);
    let agent = await Users.findOne({ email }).lean().select('point');


    if (agent) {
      statusCode = 200;
      message = "true";
      var data1 = {};
      data1.balance = agent.point;
      data = data1;
    } else {
      statusCode = 400;
      message = "user does not exist";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("error-------", error);

    res.status(500).send("Database error");
  }
};

const SetplayerOnline = async (req, res) => {
  let message = null;
  let statusCode = 400;
  const email = req.body.email;
  let data;
  try {
    // let sql = "UPDATE users SET active_player=1 WHERE email=?";
    // const agent = await conn.query(sql, email);
    let agent = await Users.updateOne({ email }, { active_player: 1 });

    // console.log(email, "email");
    //  if (agent.length > 0) {

    statusCode = 200;
    message = "Player is active";
    /*  var data1={}
       data1.activePlayer=agent[0].active_player
      data = data1;
    */ /*  } else {
      statusCode = 400;
      message = "user does not exist";
    }
    */ const responseData = {
      status: statusCode,
      message,
      // data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("error-------", error);

    res.status(500).send("Database error");
  }
};

const SetplayerOffline = async (req, res) => {
  let message = null;
  let statusCode = 400;
  const email = req.body.email;
  let data;
  try {
    // let sql = "UPDATE users SET active_player=0 WHERE email=?";
    // const agent = await conn.query(sql, email);
    let agent = await Users.updateOne({ email }, { active_player: 0 });

    // if (agent.length > 0) {

    statusCode = 200;
    message = "Player is inactive";
    /*  var data1={}
       data1.activePlayer=agent[0].active_player
*/
    // data = data1;
    /*  } else {
      statusCode = 400;
      message = "user does not exist";
    }
    */ const responseData = {
      status: statusCode,
      message,
      // data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("error-------", error);

    res.status(500).send("Database error");
  }
};

const CheckPlayer = async (req, res) => {
  let message = null;
  let statusCode = 400;
  const email = req.body.email;
  let player = false;
  let data;
  try {
    // let sql = `SELECT * FROM users where email =? and active_player=1`;
    // const agent = await conn.query(sql, email);
    let agent = await Users.find({ email }, { active_player: 1 });

    if (agent.length > 0) {
      statusCode = 200;
      message = "player is active in game";
      player = true;
    } else {
      statusCode = 400;
      message = "player is inactive in game";
    }
    const responseData = {
      status: statusCode,
      message,
      player,
    };
    res.send(responseData);
  } catch (error) {
    console.log("error-------", error);

    res.status(500).send("Database error");
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, first_name, password } = req.body;

    console.log(id, first_name, password,"kkk");

    // Check if the user exists
    // let sql = "SELECT * FROM users WHERE id = ?";
    // let users = await conn.query(sql, [id]);
    let user = await Users.findById(id);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    // Update the user data
    // sql = "UPDATE users SET first_name = ?, password = ? WHERE id = ?";
    // await conn.query(sql, [first_name, password, id]);
    let agent = await Users.findByIdAndUpdate(id, { first_name, password });

    // Return success response
    return res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
};

const updateSuperMaster = async (req, res) => {
  try {
    const { id, full_name, password } = req.body;

    // Check if the supermaster exists
    let sql = "SELECT * FROM supermaster WHERE id = ?";
    let supermasters = await conn.query(sql, [id]);
    if (supermasters.length === 0) {
      return res.status(400).send({ message: "Supermaster not found" });
    }

    // Update the supermaster data
    sql = "UPDATE supermaster SET full_name = ?, password = ? WHERE id = ?";
    await conn.query(sql, [full_name, password, id]);

    // Return success response
    return res
      .status(200)
      .send({ message: "Supermaster updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
};

const updateMasterId = async (req, res) => {
  try {
    const { id, full_name, password } = req.body;

    // Check if the master id exists
    let sql = "SELECT * FROM masterid WHERE id = ?";
    let masterIds = await conn.query(sql, [id]);
    if (masterIds.length === 0) {
      return res.status(400).send({ message: "Master ID not found" });
    }

    // Update the master id data
    sql = "UPDATE masterid SET full_name = ?, password = ? WHERE id = ?";
    await conn.query(sql, [full_name, password, id]);

    // Return success response
    return res.status(200).send({ message: "Master ID updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Something went wrong" });
  }
};
// const Adminfuntarget = async (req, res) => {
//   let message = null;
//   let statusCode = 400;
//   let sql = "";
//   let responseData;
//   let updateResponse;
//   try {
//     const value = req.body.value1;
    
//     let data = req.body
//     console.log("value---data---Adminfuntarget", data);

//     updateResponse = await Admin_funtarget.updateOne({ _id: 1 }, { data });

//     if (updateResponse) {
//       statusCode = 200;
//       message = " Profit Points updated";
//     } else {
//       statusCode = 500;
//       message = "Something went wrong! database error";
//     }

//     const responseDatajson = {
//       status: statusCode,
//       message,
//     };
//     res.send(responseDatajson);
//   } catch (error) {
//     res.status(500).send("Database error");
//   }
// };


const Adminfuntarget = async (req, res) => {
  try {
    const { value, winType, selectedOption,targetAmount,endDate,startDate } = req.body;

    // console.log("Adminfuntarget incoming data:", { value, winType, selectedOption });

    const updateResponse = await Admin_funtarget.updateOne(
      { _id: 1 },
      {
        value: value ?? -1,
        winType: winType || 'Random Win',
        selectedOption: selectedOption || 'random_win',
        targetAmount, startDate, endDate

      },
      { upsert: true } // Create if doesn't exist
    );

    const responseDatajson = {
      status: 200,
      message: "Profit Points updated",
    };

    res.status(200).send(responseDatajson);
  } catch (error) {
    console.error("Adminfuntarget Error:", error);
    res.status(500).send({
      status: 500,
      message: "Database error",
    });
  }
};



const getAdminfuntarget = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    // sql = "select * from admin_funtarget ";
    // updateResponse = await conn.query(sql);
    updateResponse = await Admin_funtarget.find({});

    if (updateResponse.length > 0) {
      //  console.log("updateResponse",updateResponse)
      data = updateResponse[0];
      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const Admin7up = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { value1, value2 } = req.body;
    //  console.log("value",value1)

    // sql = "UPDATE admin_7up SET value1=?, value2=?";
    // updateResponse = await conn.query(sql, [value1, value2]);
    updateResponse = await Admin_7up.updateOne({ value1, value2 });

    if (updateResponse) {
      // console.log("updateResponse", updateResponse);

      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const getAdmin7up = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    // sql = "select * from admin_7up ";
    // updateResponse = await conn.query(sql);
    updateResponse = await Admin_7up.find({});

    if (updateResponse.length > 0) {
      //  console.log("updateResponse",updateResponse)
      data = updateResponse[0];
      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const Admintriplechance = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { value1, value2, value3 } = req.body;
    // console.log("value", value1);

    // sql = "UPDATE admin_triplechance SET  value1=?,value2=?,value3=?";
    // updateResponse = await conn.query(sql, [value1, value2, value3]);
    updateResponse = await Admin_triplechance.find({ value1, value2, value3 });

    if (updateResponse) {
      statusCode = 200;
      message = " Profit Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const getAdmintriplechance = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    // sql = "select * from admin_triplechance ";
    // updateResponse = await conn.query(sql);
    updateResponse = await Admin_triplechance.find({});
    if (updateResponse.length > 0) {
      //  console.log("updateResponse",updateResponse)
      data = updateResponse[0];
      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const Adminroulette = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const value = req.body.value1;
    // console.log("value", value);

    // sql = "UPDATE admin_roulette SET  value=?";
    // updateResponse = await conn.query(sql, [value]);
    updateResponse = await Admin_roulette.updateOne({ _id: 1 }, { value });

    if (updateResponse) {
      statusCode = 200;
      message = " Profit Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    res.status(500).send("Database error");
  }
};
const getAdminroulette = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    // sql = "select * from admin_roulette ";
    // updateResponse = await conn.query(sql);
    updateResponse = await Admin_roulette.find({});

    if (updateResponse.length > 0) {
      //  console.log("updateResponse",updateResponse)
      data = updateResponse[0];
      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const Adminandarbahar = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { value } = req.body;
    // console.log("value", value);

    // sql = "UPDATE admin_andarbahar SET  value=?";
    // updateResponse = await conn.query(sql, [value]);
    updateResponse = await Admin_andarbahar.find({ value });

    if (updateResponse) {
      statusCode = 200;
      message = " Profit Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    res.status(500).send("Database error");
  }
};
const getAdminandarbahar = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    const { value } = req.body;
    // console.log("value", value);

    // sql = "select * from admin_andarbahar ";
    // updateResponse = await conn.query(sql);

    updateResponse = await Admin_andarbahar.find({});

    if (updateResponse.length > 0) {
      data = updateResponse[0];
      statusCode = 200;
      message = " Profit Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    res.status(500).send("Database error");
  }
};



const gamerunningfuntarget = async (req, res) => {
  try {
    const { idManager, email, e_date, s_date } = req.body;

    let find = {};
    const select = {
      playedTime: 1,
      RoundCount: 1,
      playername: 1,
      winX: 1,
      Win_singleNo: 1,
      betpoint: 1,
      winpoint: 1,
    };

   if (req.user.role_id === 5) {
  find.playername = req.user.email;
} else if (req.user.role_id < 5 && req.body.email) {
  find.playername = req.body.email;
} else if (req.user.role_id < 5 && !req.body.email) {
  // No email provided — fetch all
  find = {};
}


    // ✅ Fix: Convert strings to Date objects
    if (s_date && e_date) {
      find.playedTime = {
        $gte: new Date(s_date),
        $lte: new Date(e_date),
      };
    }

    // console.log("Final Query Conditions:", find);

    const rec = await getDataTable(Game_runningfuntarget, req, {
      find,
      select,
    });

    res.json(rec);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};


const gamerunningandarbahar = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    sql =
      //   "select * from game_running_andarbahar order by playedTime desc limit 20";
      // updateResponse = await conn.query(sql);
      updateResponse = await Game_running_andarbahar.find({}).sort({ playedTime: -1 }).limit(20);

    if (updateResponse.length > 0) {
      //  console.log("updateResponse",updateResponse)
      data = updateResponse;
      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const gamerunningroulette = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {

    const { idManager, email, e_date, s_date } = req.body;


    let find = {};
    if (req.user.role_id === 5) {
      find = { playername: req.user.email }
    } else if (req.user.role_id < 5) {
      if (req.body.email) {
        find = { playername: req.body.email }
      }

    }
    if (s_date && e_date) {
      find['playedTime'] = { $gte: s_date, $lte: e_date }
    }
    let select = { RoundCount: 1, winpoint: 1, playername: 1, Win_singleNo: 1, playedTime: 1, winamount: 1, betpoint: 1 };
    let rec = await getDataTable(Game_running_roulette, req, { find, select });
    res.json(rec);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};

const gamerunningtriplechance = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    // sql = "SELECT  `singleNo`, `doubleNo`, `tripleNo` FROM `triplechance_bet` ";

    // // sql = "select * from game_running_triplechance order by playedTime desc limit 20";
    // updateResponse = await conn.query(sql);
    updateResponse = await Triplechance_bet.find({}).sort({ playedTime: -1 }).limit(20);

    if (updateResponse.length > 0) {
      //  console.log("updateResponse",updateResponse)
      data = updateResponse;
      statusCode = 200;
      message = " Points updated";
    } else {
      statusCode = 500;
      message = "Something went wrong! database error";
    }

    const responseDatajson = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};
const gamerunningavitor = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {

    const { idManager, email, e_date, s_date } = req.body;


    let find = {};
    if (req.user.role_id === 5) {
      find = { playername: req.user.email }
    } else if (req.user.role_id < 5) {
      if (req.body.email) {
        find = { playername: req.body.email }
      }

    }
    if (s_date && e_date) {
      find['playedTime'] = { $gte: s_date, $lte: e_date }
    }
    let select = { RoundCount: 1, winpoint: 1, playername: 1, Win_singleNo: 1, playedTime: 1, winamount: 1, betpoint: 1 };
    let rec = await getDataTable(Game_running_avaitor, req, { find, select });
    res.json(rec);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Database error");
  }
};
//fornt-end
const Winamount = async (req, res) => {
  let message = null;
  let statusCode = 400;
  const { playerId, game_id } = req.body;
  // console.log(req.body)
  let data;
  try {
    // let sql = `SELECT * FROM winpoint_details where playerId =? AND game_id=?`;
    // const agent = await conn.query(sql, [playerId, game_id]);
    agent = await Winpoint_details.find({ playerId, game_id });

    if (agent.length > 0) {
      statusCode = 200;
      message = "true";
      var data1 = {};
      data1.Winamount = agent[0].point;
      data = data1;
    } else {
      statusCode = 400;
      message = "user does not exist";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("error-------", error);

    res.status(500).send("Database error");
  }
};
//front-end
const DeletePreviousWinamount = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { playerId, game_id } = req.body;

    // sql = `SELECT * FROM winpoint_details WHERE playerId = ? AND game_id=? `;
    // responseData = await conn.query(sql, [playerId, game_id]);
    responseData = await Winpoint_details.findOne({ playerId, game_id });

    if (responseData) {
      //  console.log(responseData, "responseData");
      statusCode = 400;
      const points = parseInt(responseData.point);
      // console.log(points, "points");
      // sql = `SELECT * FROM users WHERE email = ?  `;
      // let responseData1 = await conn.query(sql, [playerId]);
      responseData1 = await Users.findOne({ email: playerId });
      if (responseData1) {

        statusCode = 406;
        let updateResponse = await AppService.addPointByEmail(playerId, points);

        if (updateResponse) {

          // sql = `Delete FROM winpoint_details where playerId =? AND game_id=?`;
          // // sql = `UPDATE winpoint_details SET point=?  where playerId =? AND game_id=?`;
          // //  const userss = await conn.query(sql, [0,playerId,game_id]);          
          let userss = await AppService.WinamountDetailDel(responseData._id);

        } else {
          statusCode = 500;
          message = "Something went wrong! database error";
        }
      }
    }
    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Database error");
  }
};

const jokerBetPlaced = async (req, res) => {
  const { playerId, betAmount } = req.body;
  const cards = generateRandomCards();
  // Insert the player's bet and cards into the database
  await savePlayerData(playerId, betAmount, cards);
  res.json({
    status: 200,
    message: "Bet is placed! Dealing cards...",
    data: {
      cards,
    },
  });
};
function generateRandomCards() {
  const cards = [];
  for (let i = 0; i < 5; i++) {
    const rank = Math.floor(Math.random() * 13);
    const suit = Math.floor(Math.random() * 4);
    cards.push([rank, suit]);
  }
  return cards;
}
// function to save player data
const savePlayerData = async (playerId, betAmount, cards) => {
  // const query = `INSERT INTO game_records_joker (playerId, betAmount, card1_rank, card1_suit, card2_rank, card2_suit, card3_rank, card3_suit, card4_rank, card4_suit, card5_rank, card5_suit)
  //              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  // const values = [
  //   playerId,
  //   betAmount,
  //   cards[0][0],
  //   cards[0][1],
  //   cards[1][0],
  //   cards[1][1],
  //   cards[2][0],
  //   cards[2][1],
  //   cards[3][0],
  //   cards[3][1],
  //   cards[4][0],
  //   cards[4][1],
  // ];
  // conn.query(query, values, (err, results) => {
  //   if (err) {
  //     console.error("Error saving player data:", err);
  //   } else {
  //      console.log("Player data saved successfully");
  //   }
  // });
  let data1 = {
    playerId,
    betAmount,
    card1_rank: cards[0][0],
    card1_suit: cards[0][1],
    card2_rank: cards[1][0],
    card2_suit: cards[1][1],
    card3_rank: cards[2][0],
    card3_suit: cards[2][1],
    card4_rank: cards[3][0],
    card4_suit: cards[3][1],
    card5_rank: cards[4][0],
    card5_suit: cards[4][1],
  }
  const result = await Game_records_joker.create(data1);

}

const jokerTakeAmount = async (req, res) => {
  const { playerId, updateBalance } = req.body;
  // const fetchCreditsQuery = `SELECT credits FROM game_records_joker WHERE playerId = '${playerId}'`;
  try {
    const result = await Game_records_joker.find({ playerId });

    if (result.length === 0) {
      res.status(400).json({ status: 400, message: "User not found" });
      return;
    }
    const currentCredits = result[0].credits;
    const updatedCredits = currentCredits + parseInt(updateBalance);
    // const updateCreditsQuery = `UPDATE game_records_joker SET credits = ${updatedCredits} WHERE playerId = '${playerId}'`;
    const result1 = await Game_records_joker.updateOne({ playerId }, { credits: updatedCredits });

    res.status(200).json({
      status: 200,
      message: "Credits added and fetched updated credits",
      credits: updatedCredits,
    });

  } catch (error) {
    res.status(500).json({ status: 500, message: "Error fetching credits" });
    return;
  }
};

const jokerDoubleUp = async (req, res) => {
  const playerId = req.body.playerId;
  // Generate a random card rank and suit
  const rank = Math.floor(Math.random() * 13);
  const suit = Math.floor(Math.random() * 4);
  const card = [rank, suit];
  // Save the card in the database
  // "INSERT INTO player_data (`playerId`, `rank`, `suit`) VALUES (?, ?, ?)",
  //   [playerId, rank, suit],
  let data1 = {
    playerId, rank, suit

  }

  try {
    const result = await player_data.create(data1);
    res.json({
      status: "success",
      message: "Card saved successfully.",
      data: { doubleUp_card: card },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while saving the card.",
    });
  }
};

function getwinamount(
  betamount1,
  betamount2,
  betamount3,
  betamount4,
  betamount4,
  betamount5,
  betamount6
) {
  // Matrix 1
  const matrix1 = [
    [5, 1, 9, 25, 3],
    [8, 22, 10, 19, 7],
    [6, 18, 16, 11, 17],
    [24, 21, 14, 20, 13],
    [12, 23, 2, 4, 15],
  ];

  // Matrix 2
  const matrix2 = [
    [9, 24, 16, 4, 6],
    [13, 19, 14, 20, 25],
    [2, 18, 15, 12, 17],
    [1, 22, 11, 21, 8],
    [10, 7, 5, 23, 3],
  ];

  // Matrix 3
  const matrix3 = [
    [6, 7, 3, 24, 1],
    [23, 4, 12, 18, 2],
    [5, 19, 20, 16, 22],
    [11, 17, 9, 15, 25],
    [10, 13, 21, 4, 8],
  ];

  // Matrix 4
  const matrix4 = [
    [3, 7, 10, 4, 9],
    [24, 21, 18, 22, 8],
    [15, 14, 17, 11, 2],
    [13, 20, 12, 19, 23],
    [6, 25, 16, 1, 5],
  ];

  // Matrix 5
  const matrix5 = [
    [4, 6, 1, 23, 5],
    [25, 15, 3, 17, 13],
    [9, 19, 21, 12, 20],
    [10, 18, 16, 14, 8],
    [7, 24, 22, 2, 11],
  ];

  // Matrix 6
  const matrix6 = [
    [8, 23, 10, 13, 4],
    [2, 17, 16, 14, 24],
    [20, 12, 22, 19, 5],
    [25, 15, 9, 18, 11],
    [1, 7, 21, 3, 6],
  ];

  let winamount = 0;

  function generateRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const numbers = [];

  while (numbers.length < 5) {
    const randomNumber = generateRandomInt(1, 26);
    if (!numbers.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }

  // console.log(numbers);
  const randomNumber = Math.floor(Math.random() * 2) + 1;

  // console.log(randomNumber);

  //Matrix 1
  //ROWS
  for (let i = 0; i < matrix1.length; i++) {
    const m = matrix1[i];

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(m[j]);
      list.push(m[j + 1]);
      list.push(m[j + 2]);
      list.push(m[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount1;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(m[j]);
        list.push(m[j + 1]);
        list.push(m[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount1;
        }
      }
    }
  }
  //COLUMNS
  for (let i = 0; i < matrix1.length; i++) {
    const m = [];
    m.push(matrix1[0][i]);
    m.push(matrix1[1][i]);
    m.push(matrix1[2][i]);
    m.push(matrix1[3][i]);
    m.push(matrix1[4][i]);

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(m[j]);
      list.push(m[j + 1]);
      list.push(m[j + 2]);
      list.push(m[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount1;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(m[j]);
        list.push(m[j + 1]);
        list.push(m[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount1;
        }
      }
    }
  }

  //DIAGONALS
  let list = [8, 18, 14, 4];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [1, 10, 11, 13];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [23, 14, 11, 7];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [24, 18, 10, 25];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [6, 21, 2];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [9, 19, 17];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [2, 20, 17];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [6, 22, 9];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [5, 22, 16, 20, 15];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  list = [12, 21, 16, 19, 3];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount1;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount1;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount1;
  }

  //<-------------------------------------------------------------------------------------------------------------------------------------------------------->

  // Matrix 2
  // ROWS
  for (let i = 0; i < matrix2.length; i++) {
    const row = matrix2[i];

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(row[j]);
      list.push(row[j + 1]);
      list.push(row[j + 2]);
      list.push(row[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount2;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(row[j]);
        list.push(row[j + 1]);
        list.push(row[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount2;
        }
      }
    }
  }

  // COLUMNS
  for (let i = 0; i < matrix2.length; i++) {
    const column = [];
    column.push(matrix2[0][i]);
    column.push(matrix2[1][i]);
    column.push(matrix2[2][i]);
    column.push(matrix2[3][i]);
    column.push(matrix2[4][i]);

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(column[j]);
      list.push(column[j + 1]);
      list.push(column[j + 2]);
      list.push(column[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount2;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(column[j]);
        list.push(column[j + 1]);
        list.push(column[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount2;
        }
      }
    }
  }

  // DIAGONALS

  list = [13, 18, 11, 23];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [24, 14, 12, 8];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [25, 12, 11, 7];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [4, 14, 18, 1];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [2, 22, 5];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [16, 20, 17];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [7, 21, 5];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [16, 19, 2];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [9, 19, 15, 21, 3];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  list = [6, 20, 15, 22, 10];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount2;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount2;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount2;
  }

  //<---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // Matrix 3
  // ROWS
  for (let i = 0; i < matrix3.length; i++) {
    const row = matrix3[i];

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(row[j]);
      list.push(row[j + 1]);
      list.push(row[j + 2]);
      list.push(row[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount3;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(row[j]);
        list.push(row[j + 1]);
        list.push(row[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount3;
        }
      }
    }
  }

  // COLUMNS
  for (let i = 0; i < matrix3.length; i++) {
    const column = [];
    column.push(matrix3[0][i]);
    column.push(matrix3[1][i]);
    column.push(matrix3[2][i]);
    column.push(matrix3[3][i]);
    column.push(matrix3[4][i]);

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(column[j]);
      list.push(column[j + 1]);
      list.push(column[j + 2]);
      list.push(column[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount3;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(column[j]);
        list.push(column[j + 1]);
        list.push(column[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount3;
        }
      }
    }
  }

  // DIAGONALS
  list = [23, 19, 9, 4];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [7, 12, 16, 25];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [2, 16, 9, 13];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [11, 19, 12, 24];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [5, 17, 21];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [3, 18, 22];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [21, 15, 22];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [5, 4, 3];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [6, 4, 20, 15, 8];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  list = [1, 18, 20, 17, 10];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount3;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount3;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount3;
  }

  //<------------------------------------------------------------------------------------------------------------------------------------------------
  // Matrix 4
  // ROWS
  for (let i = 0; i < matrix4.length; i++) {
    const row = matrix4[i];

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(row[j]);
      list.push(row[j + 1]);
      list.push(row[j + 2]);
      list.push(row[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount4;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(row[j]);
        list.push(row[j + 1]);
        list.push(row[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount4;
        }
      }
    }
  }

  // COLUMNS
  for (let i = 0; i < matrix4.length; i++) {
    const column = [];
    column.push(matrix4[0][i]);
    column.push(matrix4[1][i]);
    column.push(matrix4[2][i]);
    column.push(matrix4[3][i]);
    column.push(matrix4[4][i]);

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(column[j]);
      list.push(column[j + 1]);
      list.push(column[j + 2]);
      list.push(column[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount4;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(column[j]);
        list.push(column[j + 1]);
        list.push(column[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount4;
        }
      }
    }
  }

  // DIAGONALS
  list = [24, 14, 12, 1];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [7, 18, 11, 23];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [8, 11, 12, 25];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [4, 18, 14, 13];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [15, 20, 16];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [10, 22, 2];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [10, 21, 15];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [2, 19, 16];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [3, 21, 17, 19, 5];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  list = [9, 22, 17, 20, 6];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount4;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount4;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount4;
  }

  //<---------------------------------------------------------------------------------------------------------------------------------------------------------
  // Matrix 5
  // ROWS
  for (let i = 0; i < matrix5.length; i++) {
    const row = matrix5[i];

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(row[j]);
      list.push(row[j + 1]);
      list.push(row[j + 2]);
      list.push(row[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount5;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(row[j]);
        list.push(row[j + 1]);
        list.push(row[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount5;
        }
      }
    }
  }

  // COLUMNS
  for (let i = 0; i < matrix5.length; i++) {
    const column = [];
    column.push(matrix5[0][i]);
    column.push(matrix5[1][i]);
    column.push(matrix5[2][i]);
    column.push(matrix5[3][i]);
    column.push(matrix5[4][i]);

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(column[j]);
      list.push(column[j + 1]);
      list.push(column[j + 2]);
      list.push(column[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount5;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(column[j]);
        list.push(column[j + 1]);
        list.push(column[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount5;
        }
      }
    }
  }

  // DIAGONALS
  list = [25, 19, 16, 2];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [6, 3, 12, 8];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [13, 12, 16, 24];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [23, 3, 19, 10];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [20, 14, 22];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [1, 15, 9];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [1, 17, 20];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [9, 18, 22];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [4, 15, 21, 14, 11];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  list = [5, 17, 21, 18, 7];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount5;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount5;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount5;
  }

  //<------------------------------------------------------------------------------------------------------------------------------------
  // Matrix 6
  // ROWS
  for (let i = 0; i < matrix6.length; i++) {
    const row = matrix6[i];

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(row[j]);
      list.push(row[j + 1]);
      list.push(row[j + 2]);
      list.push(row[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount6;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(row[j]);
        list.push(row[j + 1]);
        list.push(row[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount6;
        }
      }
    }
  }

  // COLUMNS
  for (let i = 0; i < matrix6.length; i++) {
    const column = [];
    column.push(matrix6[0][i]);
    column.push(matrix6[1][i]);
    column.push(matrix6[2][i]);
    column.push(matrix6[3][i]);
    column.push(matrix6[4][i]);

    let is4 = false;

    for (let j = 0; j < 2; j++) {
      const list = [];
      list.push(column[j]);
      list.push(column[j + 1]);
      list.push(column[j + 2]);
      list.push(column[j + 3]);

      if (
        numbers.includes(list[0]) &&
        numbers.includes(list[1]) &&
        numbers.includes(list[2]) &&
        numbers.includes(list[3])
      ) {
        winamount = winamount + 20 * betamount6;
        is4 = true;
      }
    }

    if (!is4) {
      for (let j = 0; j < 3; j++) {
        const list = [];
        list.push(column[j]);
        list.push(column[j + 1]);
        list.push(column[j + 2]);

        if (
          numbers.includes(list[0]) &&
          numbers.includes(list[1]) &&
          numbers.includes(list[2])
        ) {
          winamount = winamount + 4 * betamount6;
        }
      }
    }
  }

  // DIAGONALS
  list = [2, 12, 9, 3];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [23, 16, 19, 11];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [8, 17, 22, 18, 6];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [24, 19, 9, 7];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [20, 15, 21];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [10, 14, 5];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [5, 18, 21];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [10, 17, 20];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [8, 17, 22, 18, 6];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  list = [4, 14, 22, 15, 1];
  if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 20 * betamount6;
  } else if (
    numbers.includes(list[0]) &&
    numbers.includes(list[1]) &&
    numbers.includes(list[2])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[1]) &&
    numbers.includes(list[2]) &&
    numbers.includes(list[3])
  ) {
    winamount = winamount + 4 * betamount6;
  } else if (
    numbers.includes(list[2]) &&
    numbers.includes(list[3]) &&
    numbers.includes(list[4])
  ) {
    winamount = winamount + 4 * betamount6;
  }

  // console.log(numbers)
  // console.log(randomNumber)
  // console.log(winamount)
  // console.log(randomNumber*winamount)

  const ans = numbers;
  ans.push(randomNumber);
  ans.push(winamount * randomNumber);

  return ans;
}

// const bingoBetsPlaced = async (req, res) => {
//   const id = req.body.id;
//   const target_bets = req.body.target_bet;
//   const bets = JSON.parse(target_bets)
//   const set = bets[0] + bets[1] + bets[2] + bets[3] + bets[4] + bets[5]
//   // console.log(bets)

//   var sql = 'SELECT * FROM players WHERE id = ?'

//   conn.query(sql, [id], (err, result) => {
//     if (err) {
//       res.json(err);
//     }
//     else {
//       if (result.length == 0) {
//         const reply = { message: "User Not Found" }
//         res.status(400).json(reply)
//       }
//       else {

//         const ans = getwinamount(bets[0], bets[1], bets[2], bets[3], bets[4], bets[5])
//         var win
//         const bal = result[0].balance;

//         sql = 'UPDATE players SET balance = ? WHERE id = ?'
//         conn.query(sql, [bal - set, id], (err, result) => {
//           if (err) {
//             throw err;
//           }
//         })
//         if (ans.length < 7) {
//           win = 0
//         }
//         else {
//           win = ans[6]
//         }
//         if (isNaN(win)) {
//           win = 0
//         }
//         const bingo = []
//         bingo.push(ans[0])
//         bingo.push(ans[1])
//         bingo.push(ans[2])
//         bingo.push(ans[3])
//         bingo.push(ans[4])
//         bingo.push(ans[5])

//         sql = 'UPDATE players SET win_amount = ? WHERE id = ?'
//         conn.query(sql, [win, id], (err, result) => {
//           if (err) {
//             throw err;
//           }
//         })
//         const reply = {
//           message: "Bets Have Been Placed",
//           data: { bingo: bingo, win_amount: win, balance: bal - set }
//         }
//         res.status(200).json(reply)

//       }
//     }
//   })
// }

// const bingoDoubleUp = async (req, res) => {
//   const id = req.body.id;
//   const choice = req.body.double_Up;
//   //const winamount = req.body.win_amount;
//   //const w = parseFloat(winamount)

//   var sql = 'SELECT * FROM players WHERE id = ?'

//   conn.query(sql, [id], (err, result) => {
//     if (err) {
//       res.json(err);
//     }
//     else {
//       if (result.length == 0) {
//         const reply = { message: "User Not Found" }
//         res.status(400).json(reply)
//       }
//       else {

//         const small = [0, 1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30, 31, 39, 40, 41, 42, 43, 44]
//         const guarantee = [6, 19, 32, 45]
//         const big = [7, 8, 9, 10, 11, 12, 20, 21, 22, 23, 24, 25, 33, 34, 35, 36, 37, 38, 46, 47, 48, 49, 50, 51]

//         let randomNumber = Math.floor(Math.random() * 52); // Generates a random number between 0 and 51
//         const w = result[0].win_amount
//         let win = 0
//         if (guarantee.includes(randomNumber)) {
//           win = 2 * w
//         }
//         else {
//           if (choice === 'small' && small.includes(randomNumber)) {
//             win = 2 * w
//           }

//           if (choice === 'big' && big.includes(randomNumber)) {
//             win = 2 * w
//           }
//         }
//         const reply = {
//           message: "Sending Updated Win Amount",
//           data: {
//             "double_up_number": randomNumber,
//             "win_amount": win
//           }
//         }
//         sql = 'UPDATE players SET win_amount = ? WHERE id = ?'
//         conn.query(sql, [win, id], (err, result) => {
//           if (err) {
//             throw err;
//           }
//         })
//         res.status(200).json(reply)

//       }
//     }
//   })

// }

// const bingoTakeAmount = async (req, res) => {
//   const id = req.body.id;

//   var sql = 'SELECT * FROM players WHERE id = ?'

//   conn.query(sql, [id], (err, result) => {
//     if (err) {
//       res.json(err);
//     }
//     else {
//       if (result.length == 0) {
//         const reply = { message: "User Not Found" }
//         res.status(400).json(reply)
//       }
//       else {

//         const win = result[0].win_amount
//         const bal = result[0].balance

//         sql = 'UPDATE players SET win_amount = ? WHERE id = ?'

//         conn.query(sql, [0, id], (err, result) => {
//           if (err) {
//             throw err;
//           }
//         })

//         const newbal = bal + win;

//         sql = 'UPDATE players SET balance = ? WHERE id = ?'

//         conn.query(sql, [newbal, id], (err, result) => {
//           if (err) {
//             throw err;
//           }
//         })

//         const reply = { message: 'Amount Added to Balance', balance: newbal }
//         res.status(200).json(reply)
//       }
//     }
//   })

// }

// const bingoGetBalance = async (req, res) => {
//   const id = req.body.id;

//   var sql = 'SELECT * FROM players where id = ?'

//   conn.query(sql, [id], (err, result) => {
//     if (err) {
//       throw err;
//     }
//     else {
//       if (result.length == 0) {
//         const reply = { message: "User Not Found" }
//         res.status(400).json(reply)
//       }
//       else {
//         const bal = result[0].balance;
//         const reply = { balance: bal }
//         res.status(200).json(reply)
//       }
//     }
//   })
// }

const bingoBetsPlaced = async (req, res) => {
  const email = req.body.email;
  const target_bets = req.body.target_bet;
  const bets = JSON.parse(target_bets);
  const set = bets[0] + bets[1] + bets[2] + bets[3] + bets[4] + bets[5];
  // console.log(bets)

  // var sql = "SELECT * FROM users WHERE email = ?";
  try {
    const result = await Users.find({ email });
    if (result.length == 0) {
      const reply = { message: "User Not Found" };
      res.status(400).json(reply);
    } else {
      const ans = getwinamount(
        bets[0],
        bets[1],
        bets[2],
        bets[3],
        bets[4],
        bets[5]
      );
      var win;
      const poi = result[0].point;

      //  sql = "UPDATE users SET point = ? WHERE email = ?";
      // conn.query(sql, [poi - set, email], (err, result) => {

      if (ans.length < 7) {
        win = 0;
      } else {
        win = ans[6];
      }
      if (isNaN(win)) {
        win = 0;
      }
      const bingo = [];
      bingo.push(ans[0]);
      bingo.push(ans[1]);
      bingo.push(ans[2]);
      bingo.push(ans[3]);
      bingo.push(ans[4]);
      bingo.push(ans[5]);

      // sql = "UPDATE users SET win_amount = ? WHERE email = ?";
      // conn.query(sql, [win, email], (err, result) => {

      const result = await Users.updateOne({ email }, { win_amount: win });


      const reply = {
        message: "Bets Have Been Placed",
        data: { bingo: bingo, win_amount: win, point: poi - set },
      };
      res.status(200).json(reply);
    }

  } catch (error) {
    reply = { message: "Error" }
    res.status(400).json(reply);

  }


};

const bingoDoubleUp = async (req, res) => {
  const email = req.body.email;
  const choice = req.body.double_Up;
  //const winamount = req.body.win_amount;
  //const w = parseFloat(winamount)

  // var sql = "SELECT * FROM users WHERE email = ?";
  // conn.query(sql, [email], (err, result) => {
  let agent = await Users.find({ email }).lean().select('point');

  try {
    if (result.length == 0) {
      const reply = { message: "User Not Found" };
      res.status(400).json(reply);
    } else {
      const small = [
        0, 1, 2, 3, 4, 5, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 30, 31, 39,
        40, 41, 42, 43, 44,
      ];
      const guarantee = [6, 19, 32, 45];
      const big = [
        7, 8, 9, 10, 11, 12, 20, 21, 22, 23, 24, 25, 33, 34, 35, 36, 37, 38,
        46, 47, 48, 49, 50, 51,
      ];

      let randomNumber = Math.floor(Math.random() * 52); // Generates a random number between 0 and 51
      const w = result[0].win_amount;
      let win = 0;
      if (guarantee.includes(randomNumber)) {
        win = 2 * w;
      } else {
        if (choice === "small" && small.includes(randomNumber)) {
          win = 2 * w;
        }

        if (choice === "big" && big.includes(randomNumber)) {
          win = 2 * w;
        }
      }
      const reply = {
        message: "Sending Updated Win Amount",
        data: {
          double_up_number: randomNumber,
          win_amount: win,
        },
      };
      // sql = "UPDATE users SET win_amount = ? WHERE email = ?";
      // conn.query(sql, [win, email], (err, result) => {
      const result = await Users.updateOne({ email }, { win_amount: win });


      res.status(200).json(reply);
    }

  } catch (error) {
    reply = { message: "Error" }

    res.status(400).json(reply);

  }






};

const bingoTakeAmount = async (req, res) => {
  const email = req.body.email;

  // var sql = "SELECT * FROM users WHERE email = ?";
  // conn.query(sql, [email], (err, result) => {
  const result = await Users.find({ email });
  try {
    if (result.length == 0) {
      const reply = { message: "User Not Found" };
      res.status(400).json(reply);
    } else {
      const win = result[0].win_amount;
      const poi = result[0].point;

      // sql = "UPDATE users SET win_amount = ? WHERE email = ?";
      // conn.query(sql, [0, email], (err, result) => {
      const result1 = await Users.updateOne({ email }, { win_amount: 0 });


      const newpoi = poi + win;

      // sql = "UPDATE users SET point = ? WHERE email = ?";
      // conn.query(sql, [newpoi, email], (err, result) => {
      const result2 = await AppService.addPointByEmail(email, win);

      const reply = { message: "Amount Added to Point", point: newpoi };
      res.status(200).json(reply);
    }
  } catch (error) {

  }



};
//front-end
const bingoGetBalance = async (req, res) => {
  const email = req.body.email;

  // var sql = "SELECT * FROM users where email = ?";
  // conn.query(sql, [email], (err, result) => {
  const result = await Users.find({ email });

  if (result.length == 0) {
    const reply = { message: "User Not Found" };
    res.status(400).json(reply);
  } else {
    const poi = result[0].point;
    const reply = { point: poi };
    res.status(200).json(reply);
  }

};

const getStateIdData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT * FROM users WHERE role_id = 2`;
    // const stateIds = await conn.query(sql);
    let stateIds = await Users.find({ role_id: 2 });

    if (stateIds) {
      statusCode = 200;
      message = "Success";
      data = stateIds;
    } else {
      statusCode = 400;
      message = "State IDs not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};
const getStateOfAdmin = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let data;
  try {
    const { state_id } = req.body;

    // let sql = `SELECT email FROM users WHERE role_id = 2 AND idManager = ? `;
    // const stateIds = await conn.query(sql, [state_id]);
    const stateIds = await Users.find({ role_id: 2, idManager: state_id });
    if (stateIds.length > 0) {
      statusCode = 200;
      message = "Success";
      data = stateIds.map((row) => row.email);
    } else {
      statusCode = 400;
      message = "State IDs not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log(error)
    res.status(500).send("Database error");
  }
};
const getAdminMiniIdData = asyncHandler(async (req, res) => {
  let message = null;
  let statusCode = 400;
  let data = [];
  //  try {
  // let sql = `SELECT email FROM users WHERE role_id = 1`;
  // const stateIds = await conn.query(sql);
  let stateIds = await Users.find({ role_id: 1 }).select({ email: 1 });
  if (stateIds.length > 0) {
    statusCode = 200;
    message = "Success";
    data = stateIds.map((row) => row.email);;
  } else {
    statusCode = 400;
    message = "State IDs not found";
  }
  const responseData = {
    status: statusCode,
    message,
    data,
  };
  res.send(responseData);
  //  } catch (error) {
  //    res.status(500).send("Database error");
  //  }
});

const getCityIdData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT * FROM users WHERE role_id = 3`;
    let stateIds = await Users.find({ role_id: 3 });

    if (stateIds) {
      statusCode = 200;
      message = "Success";
      data = stateIds;
    } else {
      statusCode = 400;
      message = "City IDs not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const getMainIdData = async (req, res) => {
  let message = null;
  let statusCode = 400;
  try {
    // let sql = `SELECT * FROM users WHERE role_id = 4`;
    // const stateIds = await conn.query(sql);
    let stateIds = await Users.find({ role_id: 4 });

    if (stateIds) {
      statusCode = 200;
      message = "Success";
      data = stateIds;
    } else {
      statusCode = 400;
      message = "Main IDs not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const getStatebyAdmin = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { admin_number } = req.body;

    let sql = `SELECT email FROM users WHERE role_id = 2 AND admin_number = ?`;
    const stateIds = await conn.query(sql, [admin_number]);

    if (stateIds.length > 0) {
      statusCode = 200;
      message = "Success";
      data = stateIds.map((row) => row.email);
    } else {
      statusCode = 400;
      message = "State IDs not found for the provided admin_number";
    }

    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const getCitybyState = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { state_id } = req.body;

    // let sql = `SELECT email FROM users WHERE role_id = 3 AND idManager = ?`;
    // const cityIds = await conn.query(sql, [state_id]);
    let cityIds = await Users.find({ idManager: state_id.toUpperCase(), role_id: 3 });

    if (cityIds) {
      statusCode = 200;
      message = "Success";
      data = cityIds.map((row) => row.email);


      const responseData = {
        status: statusCode,
        message,
        data,
      };
      res.send(responseData);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
};

const getmainbycity = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { state_id } = req.body;

    // let sql = `SELECT email FROM users WHERE role_id = 4 AND idManager = ?`;
    // const cityIds = await conn.query(sql, [state_id]);
    let cityIds = await Users.find({ idManager: state_id, role_id: 4 });

    if (cityIds.length > 0) {
      statusCode = 200;
      message = "Success";
      data = cityIds.map((row) => row.email);
    } else {
      statusCode = 400;
      message = "City IDs not found for the provided state_id";
    }

    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    res.status(500).send("Database error");
  }
};

const deleteStateId = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { email } = req.body;

    let sql = `DELETE * FROM users WHERE email = ? `;
    let user = await conn.query(sql, [email]);

    if (user.length > 0) {
      statusCode = 201;
      message = "deleted email.";
    } else {
      statusCode = 500;
      message = "Something went wrong! Database error.";
    }

    return res.status(statusCode).json({
      status: statusCode,
      message: message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};

const deletecity = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { email } = req.body;

    let sql = `DELETE * FROM users WHERE email = ? `;
    let user = await conn.query(sql, [email]);

    if (user.length > 0) {
      statusCode = 201;
      message = "deleted email.";
    } else {
      statusCode = 500;
      message = "Something went wrong! Database error.";
    }

    return res.status(statusCode).json({
      status: statusCode,
      message: message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};
const deletemain = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { email } = req.body;

    let sql = `DELETE * FROM users WHERE email = ? `;
    let user = await conn.query(sql, [email]);

    if (user.length > 0) {
      statusCode = 201;
      message = "deleted email.";
    } else {
      statusCode = 500;
      message = "Something went wrong! Database error.";
    }

    return res.status(statusCode).json({
      status: statusCode,
      message: message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};
const deleteplayer = async (req, res) => {
  let message = null;
  let statusCode = 400;

  try {
    const { email } = req.body;

    let sql = `DELETE * FROM users WHERE email = ? `;
    let user = await conn.query(sql, [email]);

    if (user.length > 0) {
      statusCode = 201;
      message = "deleted email.";
    } else {
      statusCode = 500;
      message = "Something went wrong! Database error.";
    }

    return res.status(statusCode).json({
      status: statusCode,
      message: message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error.",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await Users.findOne({ email });
    if (userResult.role_id == 0) {
      return res
        .status(400)
        .json({ status: 400, message: "User does not exist" });
    }

    if (!userResult) {
      return res
        .status(400)
        .json({ status: 400, message: "User does not exist" });
    }

    const deleteQuery = await Users.deleteOne({ email });
    res.status(200).json({ status: 200, message: "User deleted successfully" });
  } catch (error) {
    console.log("Error deleting user:", error);

    res.status(500).json({ status: 500, message: "Failed to delete user" });
  }
};

const sendPointsUser = async (req, res) => {
  let message = null;
  let statusCode = 200;
  let responseDatajson;
  let sql = "";
  try {
    const { sender, receive, point, pin } = req.body;

    responseDatajson = await AppService.transfer_request(sender, receive, point, pin);
    message = 'Point transfred successfull'
  } catch (error) {
    statusCode = 400;
    message = error.message
    console.log(error, "show me err");
  }
  responseDatajson = {
    status: statusCode,
    message,
  };
  res.send(responseDatajson);
};

const receive1 = async (req, res) => {
  let message = null;

  let statusCode = 400;

  var data = {};

  const { emailId } = req.body;

  try {
    let sql = `SELECT * FROM  receivableapi where FromAccountName=? `;

    // let sql = `SELECT * FROM  trandableapi where FromAccountName=? order by createdat desc limit 1`;

    const agent = await conn.query(sql, emailId);

    if (agent.length > 0) {
      statusCode = 200;

      message = "success";

      data = agent;
    } else {
      statusCode = 400;

      message = "detail not found";
      data = [];
    }

    const responseData = {
      status: statusCode,

      message: message,

      data: data,
    };

    res.send(responseData);
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Database error");
  }
};
const receive = async (req, res) => {
  let message = null;

  let statusCode = 400;

  var data = {};

  const { emailId } = req.body;

  try {

    let agent = await AppService.recive_list(emailId);

    if (agent.length > 0) {
      statusCode = 200;

      message = "success";

      data = agent;
    } else {
      statusCode = 400;

      message = "detail not found";
      data = [];
    }

    const responseData = {
      status: statusCode,

      message: message,

      data: data,
    };

    res.send(responseData);
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Database error");
  }
};

const transfer = async (req, res) => {
  let message = null;
  let statusCode = 400;
  var data = {};
  const { emailId } = req.body;
  try {

    let agent = await AppService.transfer_list(emailId);

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";
      data = agent;
    } else {
      statusCode = 400;
      message = "detail not found";
      data = [];
    }
    const responseData = {
      status: statusCode,
      message: message,
      data: data,
    };
    res.send(responseData);
  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Database error");
  }
};
const accpetPointsUser = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let sql = "";
  let responseData;
  let updateResponse;
  let data;
  try {
    const { id } = req.body;
    // console.log(id);
    for (var i = 0; i < id.length; i++) {

      let tansData = await Trandableapi.findOne({ _id: id[i] }).lean();

      if (tansData) {
        statusCode = 200;
        message = "true";
        data = tansData;

        let data1 = {
          FromAccountName: tansData.FromAccountName,
          point: tansData.point,
          ToAccountName: tansData.ToAccountName,


        }
        // let userss = await Receivableapi.create(data1);

        // if (userss) {

        //   let agentdel = await Trandableapi.deleteOne({ _id: id[i] });
        //   statusCode = 200;
        //   message = " data is sending in receiver table ";
        // } else {
        //   statusCode = 500;
        //   message = "Something went wrong! database error";
        // }
      }
    }
    const responseDatajson = {
      status: statusCode,
      message: message,
      data: data,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log(error, "show me err");
    res.status(500).send("Database error");
  }
};

const DeleteUpdate = async (req, res) => {
  let message = null;
  let statusCode = 400;
  let responseData;
  let updateResponse;
  try {
    const { id, emailId } = req.body;

    for (var i = 0; i < id.length; i++) {
      responseData = await AppService.accept_point(id[i], emailId);
    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.log(error);
    res.status(500).send("Database error");
  }
};
//Front-end
const funtarget = async (req, res) => {
  let message = null;
  let statusCode = 400;
  var data = {};
  const { playerId } = req.body;
  try {
    let agent = await Game_runningfuntarget.find({ playername: playerId }).sort({ playedTime: -1 }).limit(1);

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";

      var data1 = [];

      data.zero = agent[0].Zero;
      data.one = agent[0].One;
      data.two = agent[0].Two;
      data.three = agent[0].Three;
      data.four = agent[0].Four;
      data.five = agent[0].Five;
      data.Six = agent[0].Six;
      data.Seven = agent[0].Seven;
      data.Eight = agent[0].Eight;
      data.Nine = agent[0].Nine;
      data.Ten = agent[0].Ten;
      data.Eleven = agent[0].Eleven;


      data1.push(data);
    } else {
      statusCode = 400;
      message = "detail not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    console.log(responseData,"ncjecn");
    res.send(responseData);
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Database error");
  }
};
//front-end
const triplechance = async (req, res) => {
  let message = null;
  let statusCode = 400;
  var data;
  const { playerId } = req.body;
  try {

    let agent = await Game_running_triplechance.find({ playername: playerId }).sort({ playedTime: -1 }).limit(1);

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";

      var data1 = {};
      data1.singleNo = agent[0].singleNo;
      data1.doubleNo = agent[0].doubleNo;
      data1.tripleNo = agent[0].tripleNo;
      data1.singleVal = agent[0].singleVal;
      data1.doubleVal = agent[0].doubleVal;
      data1.tripleVal = agent[0].tripleVal;

      data = data1;
      //data1.push(data);
    } else {
      statusCode = 400;
      message = "detail not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Database error");
  }
};
//front-end
const roulette = async (req, res) => {
  let message = null;
  let statusCode = 400;
  var data;
  const { playerId } = req.body;
  try {

    let agent = await Game_running_roulette.find({ playername: playerId }).sort({ playedTime: -1 }).limit(1);

    if (agent.length > 0) {
      statusCode = 200;
      message = "success";

      var data1 = {};
      data1.straightUp = JSON.parse(agent[0].straightUp);
      data1.Split = JSON.parse(agent[0].Split);
      data1.Street = JSON.parse(agent[0].Street);
      data1.Corner = JSON.parse(agent[0].Corner);
      data1.specificBet = JSON.parse(agent[0].specificBet);
      data1.line = JSON.parse(agent[0].line);
      data1.dozen1 = JSON.parse(agent[0].dozen1);
      data1.dozen2 = JSON.parse(agent[0].dozen2);
      data1.dozen3 = JSON.parse(agent[0].dozen3);
      data1.column1 = JSON.parse(agent[0].column1);
      data1.column2 = JSON.parse(agent[0].column2);
      data1.column3 = JSON.parse(agent[0].column3);
      data1.onetoEighteen = JSON.parse(agent[0].onetoEighteen);
      data1.nineteentoThirtysix = JSON.parse(agent[0].nineteentoThirtysix);
      data1.even = JSON.parse(agent[0].even);
      data1.odd = JSON.parse(agent[0].odd);
      data1.black = JSON.parse(agent[0].black);
      data1.red = JSON.parse(agent[0].red);

      data1.straightUpVal = JSON.parse(agent[0].straightUpVal);
      data1.SplitVal = JSON.parse(agent[0].SplitVal);
      data1.StreetVal = JSON.parse(agent[0].StreetVal);
      data1.CornerVal = JSON.parse(agent[0].CornerVal);
      data1.specificBetVal = JSON.parse(agent[0].specificBetVal);
      data1.lineVal = JSON.parse(agent[0].lineVal);
      data1.dozen1Val = JSON.parse(agent[0].dozen1Val);
      data1.dozen2Val = JSON.parse(agent[0].dozen2Val);
      data1.dozen3Val = JSON.parse(agent[0].dozen3Val);
      data1.column1Val = JSON.parse(agent[0].column1Val);
      data1.column2Val = JSON.parse(agent[0].column2Val);
      data1.column3Val = JSON.parse(agent[0].column3Val);
      onetoEighteenVal = JSON.parse(agent[0].onetoEighteenVal);
      data1.nineteentoThirtysixVal = JSON.parse(
        agent[0].nineteentoThirtysixVal
      );
      data1.evenVal = JSON.parse(agent[0].evenVal);
      data1.oddVal = JSON.parse(agent[0].oddVal);
      data1.blackVal = JSON.parse(agent[0].blackVal);
      data1.redVal = JSON.parse(agent[0].redVal);

      //transferRecord.date = JSON.parseInt(agent[0].createdat);
      //transferRecordArray.push(transferRecord)

      // }
      //data1.transferRecord=transferRecordArray
      data = data1;
    } else {
      statusCode = 400;
      message = "detail not found";
    }
    const responseData = {
      status: statusCode,
      message,
      data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Database error");
  }
};
const Setplayer = async (req, res) => {
  let message = null;
  let statusCode = 400;
  const { email } = req.body;
  let data;
  try {

    // console.log(email, "email");
    let update2 = await Users.updateOne({ email }, { playerStatus: 1 });



    statusCode = 200;
    message = "Player is active";
    const responseData = {
      status: statusCode,
      message,
      // data,
    };
    res.send(responseData);
  } catch (error) {
    console.log("error-------", error);

    res.status(500).send("Database error");
  }
};

const pinPassword = async (req, res) => {
  try {
    const { managerId, MemberId, required } = req.body;

    if (!managerId || !MemberId || !required) {
      return res.status(400).json({ message: "All fields are required" });
    }


    await conn.query(sql, values);
    let new1 = await Pinpass.create({ managerId, MemberId, required });


    let update2 = await Users.updateOne({ email }, { playerStatus: 1 });


    return res.status(200).json({ status: 200, message: "Form submitted successfully" });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Database error" });
  }
};


const getPlayerPoint = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }


    const rows = await Users.findOne({ email }).select('point');
    if (rows) {
      const point = rows.point;
      return res.status(200).json({ point, status: 200 });
    } else {
      return res.status(400).json({ message: "Player not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};


const sendStateIdPoints = async (req, res) => {
  try {
    const { senderEmail, email, point } = req.body;

    if (!senderEmail || !email || !point) {
      return res.status(400).json({ status: 200, message: "Sender email, recipient email, and point are required" });
    }
    let deductPointsResult = await Users.findOne({ email: senderEmail });

    let senderPoints = 0;
    if (senderEmail !== 'admin@admin.com') {



      if (deductPointsResult) {
        senderPoints = deductPointsResult.point;
      } else {
        return res.status(400).json({ message: "Invalid sender email" });
      }
    }


    let checkEmailRows = await Users.findOne({ email: email, role_id: 2 });

    if (checkEmailRows) {

      let update1 = await AppService.addPointByEmail(senderEmail, -point);

      let formData1 = { ToAccountName: email, FromAccountName: senderEmail, point: point, status: 'P' };
      let userss = await Trandableapi.create(formData1);

      return res.status(200).json({ status: 200, message: "Points updated and transaction recorded successfully" });
    } else {
      return res.status(400).json({ message: "Invalid recipient email or role_id" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};


const sendCityIdPoints = async (req, res) => {
  try {
    const { senderEmail, email, point } = req.body;

    if (!senderEmail || !email || !point) {
      return res.status(400).json({ message: "Sender email, recipient email, and point are required" });
    }

    let senderPoints = 0;
    let deductPointsResult = await Users.findOne({ email: senderEmail });

    if (senderEmail !== 'admin@admin.com') {

      if (deductPointsResult) {
        senderPoints = deductPointsResult.point;
      } else {
        return res.status(400).json({ message: "Invalid sender email" });
      }
    }


    let checkEmailRows = await Users.find({ email: email, role_id: 3 });
    if (checkEmailRows.length > 0) {
      const currentPoints = checkEmailRows[0].point;
      const newPoints = parseInt(currentPoints) + parseInt(point);


      const updatedSenderPoints = senderPoints - parseInt(point);

      let update1 = await Users.updateOne({ email: senderEmail }, { point: updatedSenderPoints });

      let formData1 = { ToAccountName: email, FromAccountName: senderEmail, point: point, status: 'P' };
      let userss = await Trandableapi.create(formData1);


      return res.status(200).json({ status: 200, message: "Points updated and transaction recorded successfully" });
    } else {
      return res.status(400).json({ message: "Invalid recipient email or role_id" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};

const sendMainIdPoints = async (req, res) => {
  try {
    const { senderEmail, email, point } = req.body;

    // console.log(senderEmail, email, point, "hello");

    if (!senderEmail || !email || !point) {
      return res.status(400).json({ message: "Sender email, recipient email, and point are required" });
    }

    const pointValue = parseInt(point, 10);
    if (isNaN(pointValue) || pointValue <= 0) {
      return res.status(400).json({ message: "Invalid point value" });
    }

    let sender = null;
    if (senderEmail !== 'admin@admin.com') {
      sender = await Users.findOne({ email: senderEmail });
      if (!sender) return res.status(400).json({ message: "Invalid sender email" });
      if (sender.point < pointValue) return res.status(400).json({ message: "Insufficient points" });
    }

    const recipient = await Users.findOne({ email: email, role_id: 4 });
    if (!recipient) {
      return res.status(400).json({ message: "Invalid recipient email or role_id" });
    }

    const updatedRecipientPoints = recipient.point + pointValue;
    // await Users.updateOne({ email }, { point: updatedRecipientPoints });

    if (senderEmail !== 'admin@admin.com') {
      const updatedSenderPoints = sender.point - pointValue;
      await Users.updateOne({ email: senderEmail }, { point: updatedSenderPoints });
    }

    await Trandableapi.create({
      ToAccountName: email,
      FromAccountName: senderEmail,
      point: pointValue,
      status: 'P'
    });

    return res.status(200).json({ status: 200, message: "Points updated and transaction recorded successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};


const sendPlayerIdPoints = async (req, res) => {
  try {
    const { senderEmail, email, point } = req.body;

    if (!senderEmail || !email || !point) {
      return res.status(400).json({ message: "Sender email, recipient email, and point are required" });
    }
    let deductPointsResult = await Users.findOne({ email: senderEmail });

    let senderPoints = 0;
    if (senderEmail !== 'admin@admin.com') {


      if (deductPointsResult) {
        senderPoints = deductPointsResult.point;
      } else {
        return res.status(400).json({ message: "Invalid sender email" });
      }
    }


    let checkEmailRows = await Users.find({ email: email, role_id: 5 });


    if (checkEmailRows.length > 0) {
      const currentPoints = checkEmailRows[0].point;
      const newPoints = parseInt(currentPoints) + parseInt(point);
      const updatedSenderPoints = senderPoints - parseInt(point);
      let update1 = await Users.updateOne({ email: senderEmail }, { point: updatedSenderPoints });


      let formData1 = { ToAccountName: email, FromAccountName: senderEmail, point: point, status: 'P' };
      let userss = await Trandableapi.create(formData1);

      return res.status(200).json({ status: 200, message: "Points updated and transaction recorded successfully" });
    } else {
      return res.status(400).json({ message: "Invalid recipient email or role_id" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};


const getEmailsByManager = async (req, res) => {
  try {
    const { idManager } = req.body;

    if (!idManager) {
      return res.status(400).json({ message: "idManager is required" });
    }
    let find = { $or: [{ idManager }, { email: idManager }] };
    let select = { email: 1, idManager: 1, point: 1, role_id: 1 };
    let rec = await getDataTable(Users, req, { find, select });
    res.json(rec);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};


const resetUserPassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    // const user = await conn.query("SELECT password FROM users WHERE email = ?", [email]);
    const user = await AppService.userByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (oldPassword !== user.password) {
      return res.status(401).json({ message: "Incorrect old password" });
    }

    let update = await Users.updateOne({ password, email })

    return res.status(200).json({ status: 200, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, message: "Internal server error" });
  }
};



const rejectPoint = async (req, res) => {
  let message = "Points rejected";
  let { emailId } = req.body;
  let statusCode = 400;
  let responseData;
  let updateResponse;

  try {
    const { id } = req.body;
    for (var i = 0; i < id.length; i++) {

      await AppService.reject_point(id[i], emailId);

    }

    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send("Database error");
  }
};

const rejectPoint1 = async (req, res) => {
  let message = null;
  let statusCode = 200;
  let sql = "";
  let responseData;
  let updateResponse;
  try {
    const { id, emailId } = req.body;
    message = await AppService.cancle_point(id, emailId);
    const responseDatajson = {
      status: statusCode,
      message,
    };
    res.send(responseDatajson);

  } catch (error) {
    console.log(error, "error");
    res.status(500).send("Database error");
  }

};

const cancelTransferableId = async (req, res) => {
  try {
    const { id } = req.body;
    // console.log("Received IDs:", id);
    let message = null;
    let statusCode = 400;

    for (let i = 0; i < id.length; i++) {
      let transferableData = await Trandableapi.find({ _id: id[i] });
      if (transferableData.length > 0) {
        const fromAccountName = transferableData[0].FromAccountName;
        const points = parseInt(transferableData[0].point);
        const cancellationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        // console.log('insertinf-canceledPoint_record');
        let data1 = {
          FromAccountName: fromAccountName,
          ToAccountName: transferableData[0].ToAccountName,
          Amount: points,
          // CancellationDate: cancellationDate
        }

        let moveC = await CanceledPoint_record.create(data1);

        // console.log('add point');

        let updatePoints = await AppService.addPointByEmail(fromAccountName, points)

        // console.log('deleteing from trandableapi ');
        let Pointsdel = await Trandableapi.deleteOne({ _id: id[i] });
        // await Receivableapi.findByIdAndDelete(id[i]);

        // const deleteReceivableSql = `DELETE FROM receivableapi WHERE id = ?`;
        // await conn.query(deleteReceivableSql, [id[i]]);

        statusCode = 200;
        message = "Transferable points canceled successfully";
      } else {
        statusCode = 400;
        message = "Record not found in either trandableapi or receivableapi table.";
      }
    }

    res.status(statusCode).json({ status: statusCode, message });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ status: 500, message: "Database error" });
  }
};


const checkPointHistory = async (req, res) => {
  try {
    const { sender } = req.body;

    if (!sender) {
      return res.status(400).json({ message: "Sender email is required" });
    }


    let historyRows = await Point_history.find({ sender }).select('sender receiver point createdat');

    return res.status(200).json({ history: historyRows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};
const sendMiniIdPoints = async (req, res) => {
  try {
    const { senderEmail, email, point } = req.body;

    if (!senderEmail || !email || !point) {
      return res.status(400).json({ message: "Sender email, recipient email, and point are required" });
    }


    let deductPointsResult = await Users.findOne({ email: senderEmail });

    const checkEmailRows = await Users.findOne({ role_id: 1, email })
    if (checkEmailRows) {


      let formData1 = { ToAccountName: email, FromAccountName: senderEmail, point: point, status: 'P' };
      let userss = await Trandableapi.create(formData1);

      return res.status(200).json({ status: 200, message: "Points updated and transaction recorded successfully" });
    } else {
      return res.status(400).json({ message: "Invalid recipient email or role_id" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database error" });
  }
};


const PointTransferData = async (req, res) => {
  const { ToUser, fromDate, toDate } = req.body;

  // Formatating fromDate and toDate 
  const formattedFromDate = moment(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');




  let rec = await Transfer_record.find({
    FromAccountName: FromUser,
    Date: { $gte: formattedFromDate, $lte: formattedToDate }
  }).select('FromAccountName ToAccountName Amount Date');
  res.json(rec);
};
const PointCancelData = async (req, res) => {
  const { ToUser, fromDate, toDate } = req.body;

  // Formatating fromDate and toDate 
  const formattedFromDate = moment(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');



  let find = {
    FromAccountName: ToUser,
    Date: { $gte: formattedFromDate, $lte: formattedToDate }

  };
  let select = { FromAccountName: 1, ToAccountName: 1, Amount: 1, CancellationDate: 1 };

  let rec = await getDataTable(Transfer_record, req, { find, select });
  res.json(rec);
};


const PointReceiveData = async (req, res) => {
  const { ToUser, fromDate, toDate } = req.body;

  // Formatating fromDate and toDate 
  const formattedFromDate = moment(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');




  let find = {
    FromAccountName: ToUser,
    Date: { $gte: formattedFromDate, $lte: formattedToDate }

  };
  let select = { FromAccountName: 1, ToAccountName: 1, Amount: 1, Date: 1 };

  let rec = await getDataTable(Transfer_record, req, { find, select });
  res.json(rec);
};



const pendingReceive = async (req, res) => {
  const { ToUser, fromDate, toDate } = req.body;


  const formattedFromDate = moment(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');


  let rec = await Receivableapi.find({
    FromAccountName: ToUser,
    Date: { $gte: formattedFromDate, $lte: formattedToDate }
  }).select('FromAccountName ToAccountName Point createdat');
  res.json(rec);
};
const rejectedPoint = async (req, res) => {
  const { ToUser, fromDate, toDate } = req.body;

  const formattedFromDate = moment(fromDate).startOf('day').format('YYYY-MM-DD HH:mm:ss');
  const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DD HH:mm:ss');


  let rec = await Rejectedpoint_record.find({
    FromAccountName: ToUser,
    Date: { $gte: formattedFromDate, $lte: formattedToDate }
  }).select('FromAccountName ToAccountName Amount RejectionDate');
  res.json(rec);
};

const deleteMainId = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await AppService.userByEmail(email);
    if (!userResult) {
      return res.status(400).json({ status: 400, message: "User does not exist" });
    }

    const idManager = userResult.email;

    let del = await Users.findOneAndDelete({ email });


    let del1 = await Users.deleteMany({ idManager });

    return res.status(200).json({ status: 200, message: "User and related users deleted successfully" });
  } catch (error) {
    console.log("Error deleting users:", error);
    res.status(500).json({ status: 500, message: "Failed to delete users" });
  }
};


// const getAdminDashborad = async (req, res) => {
//   try {
//     let walletMain = await Users.aggregate([
//       {
//         $match: {
//           role_id: 4
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalPoints: { $sum: "$point" }
//         }
//       }
//     ]);
//     walletMain = walletMain[0]?.totalPoints;
//     console.log('walletMain', walletMain)

//     let walletPlayer = await Users.aggregate([
//       {
//         $match: {
//           role_id: 5
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalPoints: { $sum: "$point" }
//         }
//       }
//     ]);
//     walletPlayer = walletPlayer[0]?.totalPoints;

//     let pointTotal = await Users.findOne({ role_id: 0 }).select('point');
//     pointTotal = pointTotal.point * -1;
//     let userTotal = await Users.countDocuments()
//     let bannedUsers = await Users.countDocuments({ status: 'banned' });
//     let dashboard = {
//       userTotal,
//       pointTotal: pointTotal,
//       bannedUsers,
//       walletMain,
//       walletPlayer,
//       betTotal,
//       winTotal,
//       profitLoss
//     }

//     return res.status(200).json({ status: 200, message: "User and related users deleted successfully", data: dashboard });
//   } catch (error) {
//     console.log("Error:", error);
//     res.status(500).json({ status: 500, message: "getAdminDashborad " });
//   }
// };



 

const getAdminDashborad = async (req, res) => {
  try {
    // Get total points for Main Wallet (role_id: 4)
    let walletMain = await Users.aggregate([
      { $match: { role_id: 4 } },
      { $group: { _id: null, totalPoints: { $sum: "$point" } } }
    ]);
    walletMain = walletMain[0]?.totalPoints || 0;

    // Get total points for Player Wallet (role_id: 5)
    let walletPlayer = await Users.aggregate([
      { $match: { role_id: 5 } },
      { $group: { _id: null, totalPoints: { $sum: "$point" } } }
    ]);
    walletPlayer = walletPlayer[0]?.totalPoints || 0;

    // Get pointTotal from admin (role_id: 0)
    let pointTotalDoc = await Users.findOne({ role_id: 0 }).select('point');
    let pointTotal = pointTotalDoc?.point ? pointTotalDoc.point * -1 : 0;

    // User counts
    let userTotal = await Users.countDocuments();
    let bannedUsers = await Users.countDocuments({ status: 'banned' });

    // Aggregate total bet and win
    const betWinStats = await Game_runningfuntarget.aggregate([
      {
        $group: {
          _id: null,
          totalBet: { $sum: "$betpoint" },
          totalWin: { $sum: "$winpoint" }
        }
      }
    ]);
    const betTotal = betWinStats[0]?.totalBet || 0;
    const winTotal = betWinStats[0]?.totalWin || 0;
    const profitLoss = betTotal - winTotal;

    // --- Daily Profit & Loss ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyStats = await Game_runningfuntarget.aggregate([
      { $match: { playedTime: { $gte: startOfDay, $lte: endOfDay } } },
      {
        $group: {
          _id: null,
          dailyBet: { $sum: "$betpoint" },
          dailyWin: { $sum: "$winpoint" }
        }
      }
    ]);
    const dailyBetTotal = dailyStats[0]?.dailyBet || 0;
    const dailyWinTotal = dailyStats[0]?.dailyWin || 0;
    const dailyProfitLoss = dailyBetTotal - dailyWinTotal;

    // Compose dashboard data
    const dashboard = {
      userTotal,
      bannedUsers,
      pointTotal,
      walletMain,
      walletPlayer,
      // Overall
      betTotal,
      winTotal,
      profitLoss,
      // Daily
      dailyBetTotal,
      dailyWinTotal,
      dailyProfitLoss
    };

    return res.status(200).json({
      status: 200,
      message: "Admin dashboard data fetched successfully",
      data: dashboard
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ status: 500, message: "getAdminDashborad error" });
  }
};




const getbetroulette = async (req, res) => {
  let data = await RouletteService.Detailroulete();
  

  res.json({ status: 200, data });
};

const getbetrouletteValue = async (req, res) => {

  let data = await RouletteService.DetailrouleteValue();

  res.json({ status: 200, data });
};




const getbetfuntarget = async (req, res) => {
  let data = await FunTargetService.Detailfuntarget();

  res.json({ status: 200, data });
};
const updateVersion = async (req, res) => {
  let { _id, versionControle, appLink } = req.body;
  let data = await version.findOneAndUpdate({ _id }, {
    appLink,
    versionControle
  }, { upsert: true });

  res.json({ status: 200, data });
};
const getVersion = async (req, res) => {
  let data = await version.findOne({ _id: 1 });

  res.json({ status: 200, data });
};
const getDailyProfitReport = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  let dailyProfitReport;

  try {

    //const dailyProfitReport = await getDailyAgentReport(email, s_date, e_date);
    if (role == 5) {
      dailyProfitReport = await getDailyPlayerReport(email, s_date, e_date);

    } else {
      dailyProfitReport = await getDailyAgentReport(email, s_date, e_date);

    }
    res.json({ status: 200, data: dailyProfitReport });

  } catch (error) {
    console.error(error);
  }
}
const getDailyPlayerWiseReport = async (req, res) => {
  let { s_date, e_date, email } = req.body;
  try {
    let results = await daily_report.aggregate([
      {
        $match: {
          'idManager': email,
          day: { $gte: new Date(s_date), $lt: new Date(e_date) }
        }
      },
      {
        $group: {
          _id: {
            player: "$user_email",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$day" } },
          },
          profit: {
            $sum: "$agent_profit"
          },

        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          agent: email,
          player: "$_id.player",
          profit: 1

        }
      }
    ]);
    console.log(results,"results");

    res.json({ status: 200, data: results });

  } catch (error) {
    console.error(error);
  }
}
const getDatewiseReport = async (req, res) => {
  let { s_date, e_date, email } = req.body;
  let prow = [];
  try {
    if (req.user.role_id == '5') {
      prow = await getDailyPlayerReport(email, s_date, e_date);

    } else if (req.user.role_id == '4') {
      prow = await getDailyAgentReport(email, s_date, e_date);
    }



    res.json({ status: 200, data: prow });

  } catch (error) {
    console.error(error);
  }
}
const getAgentRrofit = async (req, res) => {
  let { s_date, e_date, email, type } = req.body;
  let find = {}
  if (type == '') {


    find = {
      $or: [{ 'FromAccountName': email }, { 'ToAccountName': email }],
      // Date: { $gte: formattedFromDate, $lte: formattedToDate }
    };
  } else if (email && type == 'send') {


    find = {
      FromAccountName: email,
      // Date: { $gte: formattedFromDate, $lte: formattedToDate }

    };
  } else if (type == 'receive') {
    find = {
      ToAccountName: email, role_id: { $lt: 4 }
      // Date: { $gte: formattedFromDate, $lte: formattedToDate }

    };
  }
  if (s_date && e_date) {
    find['Date'] = { $gte: new Date(s_date), $lt: new Date(e_date) }
  }
  try {

    const dailyProfitReport = await agentToatal(find);

    res.json({ status: 200, data: dailyProfitReport });

  } catch (error) {
    console.error(error);
  }
}
let getDailyPlayerReport = (player, fromDate, toDate) => {
  return daily_report.aggregate([
    {
      $match: {
        'user_email': player,
        day: { $gte: new Date(fromDate), $lt: new Date(toDate) }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$day" } },
        },
        profit: {
          $sum: "$user_profit"
        },

      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        agent: player,
        profit: 1

      }
    }
  ]);
}
let getDailyAgentReport = (agent, fromDate, toDate) => {
  return daily_report.aggregate([
    {
      $match: {
        'idManager': agent,
        day: { $gte: new Date(fromDate), $lt: new Date(toDate) }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$day" } },
        },
        profit: {
          $sum: "$agent_profit"
        },

      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        agent: agent,
        profit: 1

      }
    }
  ]);
}
let getDailyAgentPlayerReport = (agent, fromDate, toDate) => {
  return Transfer_record.aggregate([
    {
      $match: {
        $or: [{ 'FromAccountName': agent }, { 'ToAccountName': agent }],
        role_id: {
          $in: [4, 5]
        },
        Date: { $gte: new Date(fromDate), $lt: new Date(toDate) }

      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
        },
        sumSend: {
          $sum: { $cond: [{ $eq: ["$FromAccountName", agent] }, "$point", 0] }
        },
        sumReceived: {
          $sum: { $cond: [{ $eq: ["$ToAccountName", agent] }, "$point", 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        agent: agent,
        sumSend: 1,
        sumReceived: 1,
        profit: { $subtract: ["$sumSend", "$sumReceived"] }

      }
    }
  ]);
}
let agentRrofit = (agent, fromDate, toDate) => {
  return Transfer_record.aggregate([
    {
      $match: {
        $or: [{ 'FromAccountName': agent }, { 'ToAccountName': agent }],
        role_id: {
          $in: [4, 5]
        },
        Date: { $gte: new Date(fromDate), $lt: new Date(toDate) }
      }
    },
    {
      $group: {
        _id: null,
        sumSend: {
          $sum: { $cond: [{ $eq: ["$FromAccountName", agent] }, "$point", 0] }
        },
        sumReceived: {
          $sum: { $cond: [{ $eq: ["$ToAccountName", agent] }, "$point", 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        agent: agent,
        sumSend: 1,
        sumReceived: 1,
        profit: { $subtract: ["$sumReceived", "$sumSend"] }

      }
    }
  ]);
}
let agentToatal = (find) => {

  return Transfer_record.aggregate([
    {
      $match: find
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$point"
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        total: 1
      }
    }
  ]);
}

const getRolletResult = async (req, res) => {
  let { s_date, e_date, email } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    const pipeline = [
      {
        $match: {
          // $or: [{ 'FromAccountName': agent}, { 'ToAccountName': agent }],
          // role_id: {
          //   $in: [4, 5]
          // },
          //playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
        }
      },

      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$playedTime" } }, RoundCount: '$RoundCount' },
          game: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: '$game.RoundCount',
          Win_singleNo: '$game.Win_singleNo',
          Date: '$_id.date'
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_running_roulette.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getFuntartgetResult = async (req, res) => {
  let { s_date, e_date, email } = req.body;

  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    const pipeline = [
      {
        $match: {
          // $or: [{ 'FromAccountName': agent}, { 'ToAccountName': agent }],
          // role_id: {
          //   $in: [4, 5]
          // },
          //    playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
        }
      },

      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$playedTime" } }, RoundCount: '$RoundCount' },
          game: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: '$game.RoundCount',
          Win_singleNo: '$game.Win_singleNo',
          Date: '$_id.date'
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_runningfuntarget.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }
}
const getAviatorResult = async (req, res) => {
  let { s_date, e_date, email } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    const pipeline = [
      {
        $match: {
          // $or: [{ 'FromAccountName': agent}, { 'ToAccountName': agent }],
          // role_id: {
          //   $in: [4, 5]
          // },
          //playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
        }
      },

      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$playedTime" } }, RoundCount: '$RoundCount' },
          game: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: '$game.RoundCount',
          Win_singleNo: '$game.Win_singleNo',
          Date: '$_id.date'
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_running_avaitor.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getFunabResult = async (req, res) => {
  let { s_date, e_date, email } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    const pipeline = [
      {
        $match: {
          // $or: [{ 'FromAccountName': agent}, { 'ToAccountName': agent }],
          // role_id: {
          //   $in: [4, 5]
          // },
          //playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
        }
      },

      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d %H:%M", date: "$playedTime" } }, RoundCount: '$RoundCount' },
          game: { $first: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: '$game.RoundCount',
          Win_singleNo: '$game.Win_singleNo',
          Date: '$_id.date'
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_running_andarbahar.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getRolletRevenu = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: 1,
          Win_singleNo: 1,
          winpoint: 1,
          betpoint: 1,
          playername: 1,
          playedTime: 1
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_running_roulette.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getRolletRevenueTotal = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalBet: {
            $sum: "$betpoint"
          },
          totalWin: {
            $sum: "$winpoint"
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          agent: email,
          totalBet: 1,
          totalWin: 1,
          total: { $subtract: ["$totalBet", "$totalWin"] }

        }
      }
    ];
    let data = await Game_running_roulette.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getFuntargetRevenueTotal = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalBet: {
            $sum: "$betpoint"
          },
          totalWin: {
            $sum: "$winpoint"
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          agent: email,
          totalBet: 1,
          totalWin: 1,
          total: { $subtract: ["$totalBet", "$totalWin"] }

        }
      }
    ];
    let data = await Game_runningfuntarget.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getFuntartgetRevenu = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;

  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: 1,
          Win_singleNo: 1,
          winpoint: 1,
          betpoint: 1,
          playername: 1,
          playedTime: 1
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_runningfuntarget.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }
}
const getAviatorRevenue = async (req, res) =>{
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: 1,
          Win_singleNo: 1,
          winpoint: 1,
          betpoint: 1,
          playername: 1,
          playedTime: 1
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_running_avaitor.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getAviatiorRevenueTotal = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalBet: {
            $sum: "$betpoint"
          },
          totalWin: {
            $sum: "$winpoint"
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          agent: email,
          totalBet: 1,
          totalWin: 1,
          total: { $subtract: ["$totalBet", "$totalWin"] }

        }
      }
    ];
    let data = await Game_running_avaitor.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}

const getFunabRevenue = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          RoundCount: 1,
          Win_singleNo: 1,
          winpoint: 1,
          betpoint: 1,
          playername: 1,
          playedTime: 1
        }
      },
      {
        $skip: skip // Skip the first 10 records
      },
      {
        $limit: limit // Limit to a maximum of 20 records
      }
    ];
    let data = await Game_running_andarbahar.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getFunabRevenueTotal = async (req, res) => {
  let { s_date, e_date, email, role } = req.body;
  try {
    let limit = req.body.size || 20;
    let skip = (req.body.page - 1) * req.body.size || 0;
    let filter = {
      playedTime: { $gte: new Date(s_date), $lt: new Date(e_date) }
    }
    if (role == 4) {
      filter['idManager'] = email;
    } else {
      filter['playername'] = email;
    }
    const pipeline = [
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          totalBet: {
            $sum: "$betpoint"
          },
          totalWin: {
            $sum: "$winpoint"
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          agent: email,
          totalBet: 1,
          totalWin: 1,
          total: { $subtract: ["$totalBet", "$totalWin"] }

        }
      }
    ];
    let data = await Game_running_andarbahar.aggregate(pipeline);

    res.json({ status: 200, data: data });

  } catch (error) {
    console.error(error);

  }

}
const getProfile = async (req, res) => {
  try {

    return res.json({ status: 200, data: req.user });

  } catch (error) {
    console.error(error);

  }
}
const updateProfile = async (req, res) => {

  let postData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    address: req.body.last_name,
    postal_code: req.body.postal_code,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    phone: req.body.phone,

  };
  try {
    let agent = await Users.findByIdAndUpdate(req.user._id, postData);

    return res.json({ status: 200, data: agent });

  } catch (error) {
    console.error(error);

  }
}



const weeklySettlementForAllPlayers = async () => {
  try {
    // Step 1: Get all managers
    const managers = await Users.find({ role_id: 4 }).select("email");

    if (!managers.length) {
      console.log("⚠️ No managers found for settlement.");
      return;
    }

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    // Step 2: Process each manager separately
    for (const manager of managers) {
      // Get all players under this manager
      const players = await Users.find({ role_id: 5, idManager: manager.email }).select("email");

      if (!players.length) {
        console.log(`Manager ${manager.email} has no players.`);
        continue;
      }

      // Aggregate only this manager's players
      const weeklyStats = await Game_runningfuntarget.aggregate([
        {
          $match: {
            playedTime: { $gte: startOfWeek },
            playername: { $in: players.map(p => p.email) },
          },
        },
        {
          $group: {
            _id: null,
            totalBet: { $sum: "$betpoint" },
            totalWin: { $sum: "$winpoint" },
          },
        },
      ]);

      const totalBet = weeklyStats[0]?.totalBet || 0;
      const totalWin = weeklyStats[0]?.totalWin || 0;
      const totalProfitLoss = totalBet - totalWin; // >0 => profit

      // Step 3: Load/create manager's ledger
      let ledger = await ManagerLedger.findOne({ managerEmail: manager.email });
      if (!ledger) {
        ledger = await ManagerLedger.create({ managerEmail: manager.email, cumulativeLoss: 0 });
      }

      console.log(
        `📊 Manager ${manager.email} -> Bet: ${totalBet}, Win: ${totalWin}, P/L: ${totalProfitLoss}, CarryLoss: ${ledger.cumulativeLoss}`
      );

      let managerShare = 0;

      if (totalProfitLoss > 0) { 
  if (ledger.cumulativeLoss > 0) {
          // Cover losses first
          if (totalProfitLoss > ledger.cumulativeLoss) {
            const recoveredProfit = totalProfitLoss - ledger.cumulativeLoss;

            // Managers get 25% of recovered profit
            managerShare = recoveredProfit * 0.25;

            // Reset loss
            ledger.cumulativeLoss = 0;
          } else {
            // Profit not enough to cover all losses
            ledger.cumulativeLoss -= totalProfitLoss;
            managerShare = 0;
          }
        } else {
          // Normal case, no losses → 50% share
          managerShare = totalProfitLoss * 0.5;
        }
      } else if (totalProfitLoss < 0) {
        // Loss case → accumulate loss
        ledger.cumulativeLoss += Math.abs(totalProfitLoss);
        managerShare = 0;
      }

      // Save updated ledger
      await ledger.save();

      // Step 4: Log/share distribution
      if (managerShare > 0) {
        await Trandableapi.create({
          role_id: 0,
          FromAccountName: "admin@admin.com",
          ToAccountName: manager.email,
          point: managerShare,
          status: "P",
        });

        console.log(
          `✅ Weekly settlement -> Manager ${manager.email} received ${managerShare}`
        );
      } else {
        console.log(`📌 Manager ${manager.email} gets no share this week.`);
      }
    }

    console.log("✅ Weekly settlement completed successfully.");
  } catch (error) {
    console.error("❌ Weekly Settlement Error:", error);
  }
}; 
cron.schedule("0 7 * * 1", () => {
  console.log("Running weekly settlement...");
  weeklySettlementForAllPlayers();
});
  // why this function not trigger on 7 am monday 


// cron.schedule("* * * * *", () => { // Every 1 minute
//   console.log("Running test settlement...");
//   weeklySettlementForAllPlayers();
// });

// Also trigger once immediately on startup
// weeklySettlementForAllPlayers();


const getChildTotalProfit = async (req, res) => {
  try {
    const { email, s_date, e_date } = req.body;
    console.log(email, s_date, e_date,req.body,"--------------------------------");

    if (!email || !s_date || !e_date) {
      return res.status(400).json({ status: 400, message: "Missing parameters" });
    }

    // Step 1: Find direct children of given email
    const children = await Users.find({ idManager: email }).select("email");

    if (children.length === 0) {
      return res.json({ status: 200, data: [] });
    }

    const results = [];

    // Step 2: For each child, get all their downline (including players)
    for (let child of children) {
      const hierarchy = await Users.aggregate([
        { $match: { email: child.email } },
        {
          $graphLookup: {
            from: "users",
            startWith: "$email",
            connectFromField: "email",
            connectToField: "idManager",
            as: "downline"
          }
        },
        {
          $project: {
            allUsers: { $concatArrays: [["$email"], "$downline.email"] }
          }
        }
      ]);

      const allEmails = hierarchy[0]?.allUsers || [];

      // Step 3: Aggregate profit for this child's full subtree
      const profit = await daily_report.aggregate([
        {
          $match: {
            user_email: { $in: allEmails },
            day: { $gte: new Date(s_date), $lt: new Date(e_date) }
          }
        },
        {
          $group: {
            _id: null,
            profit: { $sum: "$user_profit" },
            agentProfit: { $sum: "$agent_profit" }
          }
        }
      ]);

      results.push({
        child: child.email,       // direct child
        profit: profit[0]?.profit || 0,
        agentProfit: profit[0]?.agentProfit || 0
      });
    }

    return res.json({ status: 200, data: results });

  } catch (error) {
    console.error("Error fetching profit:", error);
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
};





module.exports = {
  getDatewiseReport, getProfile, updateProfile,
  getRolletRevenu, getRolletRevenueTotal, getFuntartgetRevenu, getFuntargetRevenueTotal,
  getFunabRevenue, getFunabRevenueTotal,getFunabResult,
  getAviatorRevenue,getAviatiorRevenueTotal,getAviatorResult,
  getRolletResult, getFuntartgetResult,
  getAgentRrofit, getDailyProfitReport, getDailyPlayerWiseReport,
  getVersion, updateVersion,
  getbetfuntarget,
  getbetroulette, getbetrouletteValue,
  getAdminDashborad,
  pinPassword,
  Setplayer,
  roulette,
  triplechance,
  funtarget,
  deleteUser,
  deleteStateId,
  deletecity,
  deleteplayer,
  deletemain,
  getPass,
  DeletePreviousWinamount,
  Winamount,
  gamerunningtriplechance,gamerunningavitor,
  gamerunningroulette,
  gamerunningandarbahar,
  gamerunningfuntarget,
  // gamerunning,
  Adminfuntarget,
  Adminandarbahar,
  Adminroulette,
  Admintriplechance,
  Admin7up,
  getAdmin7up,
  getAdminroulette,
  getAdminandarbahar,
  getAdminfuntarget,
  getAdmintriplechance,

  CheckPlayer,
  SetplayerOnline,
  SetplayerOffline,
  receive,
  receive1,

  onbalance,
  transferPoint,
  /* createDistrubutor ,
    createStokez,
    createAgent,
    createPlayer,
    createUser,  
    getUsers,
    getAdminData,
    sendPoints,
    changePassword,
    resetPassword,
    getAgents,
    getAgentsData, */
  getPlayerData,
  getPlayerHistoryData,
  getSuperMasterData,
  getMasterIdData,

  changePercentage,
  UserShare,
  jokerBetPlaced,
  jokerTakeAmount,
  jokerDoubleUp,
  bingoBetsPlaced,
  bingoDoubleUp,
  bingoTakeAmount,
  bingoGetBalance,

  sendPoints,
  sendPointstoSuperMaster,
  sendPointstoMasterId,
  sendPointstoPlayer,

  //getAllPlayerData,
  AndarBaharGamePlayHistoryData,
  RoulletGamePlayHistoryData,
  FunTargetGamePlayHistoryData,
  TripleChanceGamePlayHistoryData,
  SevenUpGamePlayHistoryData,
  // PokergetPlayerHistoryData,
  // TigerVsElephantgetPlayerHistoryData,
  //LuckyBallgetPlayerHistoryData,
  Transaction,
  PointTransfer,
  PointReceive,
  PointCancel,
  PointRejected,
  PointHistory,
  GameReport,
  DailyStatus,

  getPlayerIdData,
  updateUser,
  updateSuperMaster,
  updateMasterId,

  getStateOfAdmin,
  getAdminMiniIdData,
  getStateIdData,
  getStatebyAdmin,
  getCitybyState,
  getCityIdData,
  getmainbycity,
  getMainIdData,
  sendPointsUser,
  transfer,
  accpetPointsUser,
  DeleteUpdate,
  getPlayerPoint,
  sendStateIdPoints,
  sendMainIdPoints,
  sendCityIdPoints,
  sendPlayerIdPoints,
  getEmailsByManager,
  resetUserPassword,
  rejectPoint,
  rejectPoint1,
  cancelTransferableId,
  checkPointHistory,
  sendMiniIdPoints,

  PointTransferData,
  pendingReceive,
  rejectedPoint,
  PointReceiveData,
  PointCancelData,
  deleteMainId,
  weeklySettlementForAllPlayers,
  getChildTotalProfit


  /* getStokezPointHistory,
    getAgentPointHistory,
    getPlayerPointHistory,
    getDoubleChanceHistory,
    getJeetoJokerHistory,
    get16CardsHistory,
    getSpinGameHistory,
 */
};
