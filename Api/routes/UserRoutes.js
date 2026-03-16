const router = require("express").Router();
// import auth controller
const UsersController = require("../controllers/UserController");

const {protect} = require('../middleware/auth')
//const auth = require('../middleware/authVerification')
//import validation
//const check = require('../validation/CheckValidation')
/* router.post('/createDistrubutor',check.distValidator(),UsersController.createDistrubutor)
router.post('/createStokez',check.stokezValidator(),UsersController.createStokez)
router.post('/createAgent',check.agentValidator(),UsersController.createAgent)
router.post('/createPlayer',check.playerValidator(),UsersController.createPlayer)



router.post('/createUser',check.userValidator(),UsersController.createUser)

router.post('/sendPoints',check.userPointsVal(),UsersController.sendPoints)
router.post('/sendStokezPoints',check.stokezPointsVal(),UsersController.sendPointstoStokez)
router.post('/sendAgentPoints',check.agentPointsVal(),UsersController.sendPointstoAgent)
router.post('/sendPlayerPoints',check.playerPointsVal(),UsersController.sendPointstoPlayer)


 */

//router.post('/transferPoints',UsersController.transferPoints)

//router.get('/getAgents',UsersController.getAgentsData)
router.get("/getPassword", UsersController.getPass);

router.put("/updateUser", UsersController.updateUser);
router.put("/updateSuperMaster", UsersController.updateSuperMaster);
router.put("/updateMasterId", UsersController.updateMasterId);

router.get("/getPlayerId", UsersController.getPlayerIdData);




router.get("/getCityIdData", UsersController.getCityIdData);
router.get("/getStateIdData", UsersController.getStateIdData);
router.get("/getAdminMiniIdData", UsersController.getAdminMiniIdData);
router.post("/getStateOfAdmin", UsersController.getStateOfAdmin);


router.post("/getStatebyAdmin", UsersController.getStatebyAdmin);
router.post("/getCitybyState", UsersController.getCitybyState);
router.post("/getmainbycity", UsersController.getmainbycity);
router.get("/getMainIdData", UsersController.getMainIdData);

router.post("/deleteState", UsersController.deleteStateId);
router.post("/deleteCity", UsersController.deletecity);
router.post("/deletemain", UsersController.deletemain);
router.post("/deleteplayer", UsersController.deleteplayer);
router.post("/deleteUser", UsersController.deleteUser);
router.post("/Setplayer", UsersController.Setplayer);







router.get("/getSuperMasterData", UsersController.getSuperMasterData);

router.get("/getMasterIdData", UsersController.getMasterIdData);

router.get(
  "/AndarBaharGamePlayHistory",
  UsersController.AndarBaharGamePlayHistoryData
);
router.get(
  "/RoulletGamePlayHistory",
  UsersController.RoulletGamePlayHistoryData
);
router.get(
  "/FunTargetGamePlayHistory",
  UsersController.FunTargetGamePlayHistoryData
);
router.get(
  "/TripleChanceGamePlayHistory",
  UsersController.TripleChanceGamePlayHistoryData
);
router.get(
  "/SevenUpGamePlayHistory",
  UsersController.SevenUpGamePlayHistoryData
);

router.get("/TransactionHistory", UsersController.Transaction);
router.get("/PointTransferred", UsersController.PointTransfer);
router.get("/PointReceived", UsersController.PointReceive);
router.get("/PointCancel", UsersController.PointCancel);
router.get("/PointRejected", UsersController.PointRejected);

router.post("/getDailyProfitReport", protect,UsersController.getDailyProfitReport);
router.post("/getAgentRrofit", protect,UsersController.getAgentRrofit);
router.post("/getDailyPlayerWiseReport", protect,UsersController.getDailyPlayerWiseReport);
router.post("/getDatewiseReport", protect,UsersController.getDatewiseReport);



router.post("/getRolletRevenu",UsersController.getRolletRevenu);
router.post( "/getRolletRevenueTotal", UsersController.getRolletRevenueTotal); 


router.post( "/getFuntartgetRevenu", UsersController.getFuntartgetRevenu); 
router.post("/getFuntargetRevenueTotal",UsersController.getFuntargetRevenueTotal);

router.post("/getAviatorRevenu",UsersController.getAviatorRevenue);
router.post( "/getAviatorRevenueTotal", UsersController.getAviatiorRevenueTotal); 
router.post("/getAviatorResult",protect,UsersController.getAviatorResult);


router.post("/getFunabRevenu",UsersController.getFunabRevenue);
router.post( "/getFunabRevenueTotal", UsersController.getFunabRevenueTotal); 
router.post("/getFunabResult",protect,UsersController.getFunabResult);


router.post("/sendPoints", UsersController.sendPoints);

router.post("/sendSuperMasterPoints", protect,UsersController.sendPointstoSuperMaster);
router.post("/sendMasterIdPoints", protect,UsersController.sendPointstoMasterId);
router.post("/sendPlayerPoints", protect,UsersController.sendPointstoPlayer);
/* ----------------------------------------------------------------------------------------- */
router.post("/changePercentage", UsersController.changePercentage);
router.get("/UserShare", UsersController.UserShare);

router.get("/GameReport", UsersController.GameReport);
router.get("/DailyStatus", UsersController.DailyStatus);
router.post("/SetplayerOnline", UsersController.SetplayerOnline);
router.post("/pinPassword", protect,UsersController.pinPassword);

router.get("/getProfile",protect, UsersController.getProfile);
router.post("/updateProfile", protect, UsersController.updateProfile);

/* router.get('/PokergetPlayerHistory',UsersController.PokergetPlayerHistoryData)
router.get('/TigerVsElephantgetPlayerHistory',UsersController.TigerVsElephangetPlayerHistoryData)
router.get('/LuckyBallgetPlayerHistory',UsersController.LuckyBallgetPlayerHistoryData) */

//router.get('/getAllPlayer',UsersController.getAllPlayerData)

/* router.get('/pointsStokezHistory',UsersController.getStokezPointHistory)
router.get('/pointsAgentHistory',UsersController.getAgentPointHistory)
router.get('/pointsPlayerHistory',UsersController.getPlayerPointHistory)


router.get('/GameDoubleChanceHistory',UsersController.getDoubleChanceHistory)
router.get('/GameJeetoJokerHistory',UsersController.getJeetoJokerHistory)
router.get('/Game16CardsHistory',UsersController.get16CardsHistory)
router.get('/GameSpinGameHistory',UsersController.getSpinGameHistory)
 */

/* router.post('/changePassword',auth,UsersController.changePassword)
router.post('/resetPassword',check.changePass(),UsersController.resetPassword)
router.get('/',UsersController.getUsers)
router.get('/admindata',UsersController.getAdminData)
router.get('/AgentsData',UsersController.getAllAgents)


router.get('/agents',UsersController.getAgents)

router.get('/getStokez',UsersController.getStokez) */

// router.post('/profileUpload',UsersController.uploadProfilePic)
// router.get('/:id/avatar',UsersController.retrieveProfilePic)
// router.post('/friend_request',check.frientValidator(),UsersController.friendRequest)
// router.get('/find',UsersController.searchPlayers)
// router.get('/friend_req_notification/:user_id', UsersController.getFriendReqNotify)
// router.post('/friend_req_status_update', UsersController.updateFriendReqStatus)
/* router.get("/test", (req, res) => {
    res.send('sdfdfdfd')
}); */
router.post("/triplechance", UsersController.triplechance);
router.post("/roulette", UsersController.roulette);

router.post("/onbalance", UsersController.onbalance);

router.post("/Admin7up", UsersController.Admin7up);
router.get("/getAdmin7up", UsersController.getAdmin7up);

router.post("/Adminandarbahar", UsersController.Adminandarbahar);
router.get("/getAdminandarbahar", UsersController.getAdminandarbahar);

  router.post("/Admintriplechance", UsersController.Admintriplechance);
  router.get("/getAdmintriplechance", UsersController.getAdmintriplechance);



  router.get("/getbetfuntarget", UsersController.getbetfuntarget);

  // router.get("/gamerunning",UsersController.gamerunning);
 

  router.get("/gamerunningandarbahar",UsersController.gamerunningandarbahar);
  router.get("/gamerunningtriplechance",UsersController.gamerunningtriplechance);

router.post("/jokerTakeAmount", UsersController.jokerTakeAmount);
router.post("/jokerDoubleUp", UsersController.jokerDoubleUp);
router.post("/bingoDoubleUp", UsersController.bingoDoubleUp);
router.post("/bingoTakeAmount", UsersController.bingoTakeAmount);
router.post("/bingoGetBalance", UsersController.bingoGetBalance);
//router.post("/sendPointsUsers", UsersController.trysendPointsUser);

router.post("/sendPointsUsers", UsersController.sendPointsUser);

router.post("/DeleteUpdate", UsersController.DeleteUpdate);
router.post("/accpetPointsUser", UsersController.accpetPointsUser);
router.post("/transfer", UsersController.transfer);
router.post("/receive", UsersController.receive);
router.post("/getPlayerPoint", UsersController.getPlayerPoint);


router.post("/resetUserPassword", UsersController.resetUserPassword);

router.post("/rejectPoint", UsersController.rejectPoint);


router.post("/cancelTransferableId", UsersController.cancelTransferableId);

router.post("/checkPointHistory", UsersController.checkPointHistory);
router.post("/getChildTotalProfit", UsersController.getChildTotalProfit);


router.post("/PointTransferData", UsersController.PointTransferData);
router.post("/pendingReceive", UsersController.pendingReceive);
router.post("/rejectedPoint", UsersController.rejectedPoint);
router.post("/PointReceiveData", UsersController.PointReceiveData);
router.post("/PointCancelData", UsersController.PointCancelData);

//user action
router.post("/deleteMainId",protect, UsersController.deleteMainId);






//dsahboard Admin
router.get("/getAdminDashboard", UsersController.getAdminDashborad);
router.post("/updateVersion", UsersController.updateVersion);
router.get("/getVersion", protect,UsersController.getVersion);


router.post( "/getFuntartgetResult", protect,UsersController.getFuntartgetResult); 
router.post("/getRolletResult",protect,UsersController.getRolletResult);
router.post("/getPlayer", protect,UsersController.getPlayerData);
router.post("/getEmailsByManager", protect,UsersController.getEmailsByManager);

router.post("/gamerunningavitor",protect,UsersController.gamerunningavitor);
router.post("/gamerunningroulette",protect,UsersController.gamerunningroulette);
router.post("/gamerunningfuntarget",protect,UsersController.gamerunningfuntarget);
// router.post("/gamerunningfuntarget",protect,UsersController.gamerunningfuntargetRound);



router.get("/getbetroulette",protect,UsersController.getbetroulette);
router.get("/getbetrouletteValue",protect,UsersController.getbetrouletteValue);


router.get("/getAdminfuntarget",protect, UsersController.getAdminfuntarget);

router.post("/Adminroulette", protect,UsersController.Adminroulette);
router.get("/getAdminroulette",protect, UsersController.getAdminroulette);
router.post("/Adminfuntarget", protect,UsersController.Adminfuntarget);

router.post("/sendStateIdPoints", protect,UsersController.sendStateIdPoints);
router.post("/sendMainIdPoints",protect, UsersController.sendMainIdPoints);
router.post("/sendCityIdPoints",protect, UsersController.sendCityIdPoints);
router.post("/sendPlayerIdPoints", protect,UsersController.sendPlayerIdPoints);
router.post("/sendMiniIdPoints", protect,UsersController.sendMiniIdPoints);

router.post("/PointHistory", protect,UsersController.PointHistory);


//mobile-api
  
router.post("/Winamount", UsersController.Winamount);
router.post("/DeletePreviousWinamount", UsersController.DeletePreviousWinamount);
router.post("/CheckPlayer", UsersController.CheckPlayer);
router.post("/SetplayerOffline", UsersController.SetplayerOffline);
router.post("/funtarget", UsersController.funtarget);
router.post("/transferPoint", UsersController.transferPoint);
router.post("/rejectPoint1", UsersController.rejectPoint1);
router.post("/jokerBetPlaced", UsersController.jokerBetPlaced);
router.post("/bingoBetsPlaced", UsersController.bingoBetsPlaced);

module.exports = router;
