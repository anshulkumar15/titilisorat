import { Injectable, PipeTransform } from '@angular/core';
import { debounceTime, delay, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const usersApi = environment.apiUrl + '/user';
@Injectable({
  providedIn: 'root'
})

export class UserListService {

  constructor(private http: HttpClient) { }
  //getUsers
  getList(data: any) {
    return this.http.post<any>(usersApi, data);
  }


  getUser(id: any) {
    return this.http.get<any>(usersApi + '/' + id);
  }


  updateUserStatus(id: string, data: any) {
    return this.http.post<any>(usersApi + '/status/' + id, data);
  }



  /////////////////////////////////////////////////


  //const auth = require('../middleware/authVerification')
  //import validation
  //const check = require('../validation/CheckValidation')
  /* return this.http.post<any>(usersApi +'/createDistrubutor',check.distValidator(),d createDistrubutor)
  return this.http.post<any>(usersApi +'/createStokez',check.stokezValidator(),d createStokez)
  return this.http.post<any>(usersApi +'/createAgent',check.agentValidator(),d createAgent)
  return this.http.post<any>(usersApi +'/createPlayer',check.playerValidator(),d createPlayer)
  
  
  
  return this.http.post<any>(usersApi +'/createUser',check.userValidator(),d createUser)
  
  return this.http.post<any>(usersApi +'/sendPoints',check.userPointsVal(),d sendPoints)
  return this.http.post<any>(usersApi +'/sendStokezPoints',check.stokezPointsVal(),d sendPointstoStokez)
  return this.http.post<any>(usersApi +'/sendAgentPoints',check.agentPointsVal(),d sendPointstoAgent)
  return this.http.post<any>(usersApi +'/sendPlayerPoints',check.playerPointsVal(),d sendPointstoPlayer)
  
  
   */

  //return this.http.post<any>(usersApi +'/transferPoints',d transferPoints)

  //return this.http.get<any>(usersApi +'/getAgents',d getAgentsData)

  getPlayer(d) {
    return this.http.post<any>(usersApi + "/getPlayer", d);

  }
  getPassword(d) {
    return this.http.get<any>(usersApi + "/getPassword");

  }
  updateUser(d) {
    return this.http.put<any>(usersApi + "/updateUser", d);

  }
  updateSuperMaster(d) {
    return this.http.put<any>(usersApi + "/updateSuperMaster", d);

  }
  updateMasterId(d) {
    return this.http.put<any>(usersApi + "/updateMasterId", d);

  }
  getPlayerId(d) {
    return this.http.get<any>(usersApi + "/getPlayerId", d);

  }


  getAdminMiniIdData() {
    return this.http.get<any>(usersApi + "/getAdminMiniIdData");

  }
  getCityIdData(d) {
    return this.http.get<any>(usersApi + "/getCityIdData", d);

  }
  getStateIdData(d) {
    return this.http.get<any>(usersApi + "/getStateIdData", d);

  }
  getStatebyAdmin(d) {
    return this.http.post<any>(usersApi + "/getStatebyAdmin", d);

  }
  getStateOfAdmin(d) {
    return this.http.post<any>(usersApi + "/getStateOfAdmin", d);
  }

  getCitybyState(d) {
    return this.http.post<any>(usersApi + "/getCitybyState", d);
  }
  getmainbycity(d) {
    return this.http.post<any>(usersApi + "/getmainbycity", d);

  }
  getMainIdData(d) {
    return this.http.get<any>(usersApi + "/getMainIdData", d);

  }

  deleteState(d) {
    return this.http.post<any>(usersApi + "/deleteState", d);

  }

  deleteCity(d) {
    return this.http.post<any>(usersApi + "/deleteCity", d);

  }
  deletemain(d) {
    return this.http.post<any>(usersApi + "/deletemain", d);

  }
  deleteplayer(d) {
    return this.http.post<any>(usersApi + "/deleteplayer", d);

  }
  deleteUser(d) {
    return this.http.post<any>(usersApi + "/deleteUser", d);

  }
  Setplayer(d) {
    return this.http.post<any>(usersApi + "/Setplayer", d);

  }






  getSuperMasterData(d) {
    return this.http.get<any>(usersApi + "/getSuperMasterData", d);

  }
  getMasterIdData(d) {
    return this.http.get<any>(usersApi + "/getMasterIdData", d);

  }

  AndarBaharGamePlayHistory(d) {
    return this.http.get<any>(usersApi + "/AndarBaharGamePlayHistory", d);
  }

  RoulletGamePlayHistory(d) {
    return this.http.get<any>(usersApi + "/RoulletGamePlayHistory", d);
  }


  FunTargetGamePlayHistory(d) {
    return this.http.get<any>(usersApi + "/FunTargetGamePlayHistory", d);
  }
  TripleChanceGamePlayHistory(d) {
    return this.http.get<any>(usersApi + "/TripleChanceGamePlayHistory", d);

  }


  SevenUpGamePlayHistory(d) {
    return this.http.get<any>(usersApi + "/SevenUpGamePlayHistory", d);
  }

  TransactionHistory(d) {
    return this.http.get<any>(usersApi + "/TransactionHistory", d);

  }
  PointTransferred(d) {
    return this.http.get<any>(usersApi + "/PointTransferred", d);

  }
  PointReceived(d) {
    return this.http.get<any>(usersApi + "/PointReceived", d);

  }
  PointCancel(d) {
    return this.http.get<any>(usersApi + "/PointCancel", d);

  }
  PointRejected(d) {
    return this.http.get<any>(usersApi + "/PointRejected", d);

  }
  PointHistory(d) {
    return this.http.post<any>(usersApi + "/PointHistory", d);

  }
  sendPoints(d) {
    return this.http.post<any>(usersApi + "/sendPoints", d);

  }
  sendSuperMasterPoints(d) {
    return this.http.post<any>(usersApi + "/sendSuperMasterPoints", d);

  }
  sendMasterIdPoints(d) {
    return this.http.post<any>(usersApi + "/sendMasterIdPoints", d);

  }
  sendPlayerPoints(d) {
    return this.http.post<any>(usersApi + "/sendPlayerPoints", d);

  }
  /* ----------------------------------------------------------------------------------------- */
  changePercentage(d) {
    return this.http.post<any>(usersApi + "/changePercentage", d);

  }
  UserShare(d) {
    return this.http.get<any>(usersApi + "/UserShare", d);

  }
  GameReport(d) {
    return this.http.get<any>(usersApi + "/GameReport", d);

  }
  DailyStatus(d) {
    return this.http.get<any>(usersApi + "/DailyStatus", d);

  }
  SetplayerOnline(d) {
    return this.http.post<any>(usersApi + "/SetplayerOnline", d);

  }
  SetplayerOffline(d) {
    return this.http.post<any>(usersApi + "/SetplayerOffline", d);

  }
  CheckPlayer(d) {
    return this.http.post<any>(usersApi + "/CheckPlayer", d);

  }
  pinPassword(d) {
    return this.http.post<any>(usersApi + "/pinPassword", d);

  }

  /* return this.http.get<any>(usersApi +'/PokergetPlayerHistory',d PokergetPlayerHistoryData)
  return this.http.get<any>(usersApi +'/TigerVsElephantgetPlayerHistory',d TigerVsElephangetPlayerHistoryData)
  return this.http.get<any>(usersApi +'/LuckyBallgetPlayerHistory',d LuckyBallgetPlayerHistoryData) */

  //return this.http.get<any>(usersApi +'/getAllPlayer',d getAllPlayerData)

  /* return this.http.get<any>(usersApi +'/pointsStokezHistory',d getStokezPointHistory)
  return this.http.get<any>(usersApi +'/pointsAgentHistory',d getAgentPointHistory)
  return this.http.get<any>(usersApi +'/pointsPlayerHistory',d getPlayerPointHistory)
  
  
  return this.http.get<any>(usersApi +'/GameDoubleChanceHistory',d getDoubleChanceHistory)
  return this.http.get<any>(usersApi +'/GameJeetoJokerHistory',d getJeetoJokerHistory)
  return this.http.get<any>(usersApi +'/Game16CardsHistory',d get16CardsHistory)
  return this.http.get<any>(usersApi +'/GameSpinGameHistory',d getSpinGameHistory)
   */

  /* return this.http.post<any>(usersApi +'/changePassword',auth,d changePassword)
  return this.http.post<any>(usersApi +'/resetPassword',check.changePass(),d resetPassword)
  return this.http.get<any>(usersApi +'/',d getUsers)
  return this.http.get<any>(usersApi +'/admindata',d getAdminData)
  return this.http.get<any>(usersApi +'/AgentsData',d getAllAgents)
  
  
  return this.http.get<any>(usersApi +'/agents',d getAgents)
  
  return this.http.get<any>(usersApi +'/getStokez',d getStokez) */

  // return this.http.post<any>(usersApi +'/profileUpload',d uploadProfilePic)
  // return this.http.get<any>(usersApi +'/:id/avatar',d retrieveProfilePic)
  // return this.http.post<any>(usersApi +'/friend_request',check.frientValidator(),d friendRequest)
  // return this.http.get<any>(usersApi +'/find',d searchPlayers)
  // return this.http.get<any>(usersApi +'/friend_req_notification/:user_id', d getFriendReqNotify)
  // return this.http.post<any>(usersApi +'/friend_req_status_update', d updateFriendReqStatus)
  /* return this.http.get<any>(usersApi +"/test", (req, res) => {
      res.send('sdfdfdfd')
  }); */
  funtarget(d) {
    return this.http.post<any>(usersApi + "/funtarget", d);

  }
  triplechance(d) {
    return this.http.post<any>(usersApi + "/triplechance", d);

  }
  roulette(d) {
    return this.http.post<any>(usersApi + "/roulette", d);

  }



  transferPoint(d) {
    return this.http.post<any>(usersApi + "/transferPoint", d);

  }
  onbalance(d) {
    return this.http.post<any>(usersApi + "/onbalance", d);

  }


  Admin7up(d) {
    return this.http.post<any>(usersApi + "/Admin7up", d);

  }
  getAdmin7up(d) {
    return this.http.get<any>(usersApi + "/getAdmin7up", d);

  }
  Adminfuntarget(d) {
    return this.http.post<any>(usersApi + "/Adminfuntarget", d);

  }
  getAdminfuntarget() {
    return this.http.get<any>(usersApi + "/getAdminfuntarget");

  }
  Adminandarbahar(d) {
    return this.http.post<any>(usersApi + "/Adminandarbahar", d);

  }
  getAdminandarbahar(d) {
    return this.http.get<any>(usersApi + "/getAdminandarbahar", d);

  }




  Adminroulette(d) {
    return this.http.post<any>(usersApi + "/Adminroulette", d);

  }
  getAdminroulette() {
    return this.http.get<any>(usersApi + "/getAdminroulette");

  }
  Admintriplechance(d) {
    return this.http.post<any>(usersApi + "/Admintriplechance", d);

  }
  getAdmintriplechance() {
    return this.http.get<any>(usersApi + "/getAdmintriplechance");

  }



  gamerunning(d) {
    return this.http.get<any>(usersApi + "/gamerunning", d);

  }
  gamerunningfuntarget(d) {
    return this.http.post<any>(usersApi + "/gamerunningfuntarget", d);

  }
  gamerunningandarbahar(d) {
    return this.http.get<any>(usersApi + "/gamerunningandarbahar", d);

  }
  gamerunningroulette(d) {
    return this.http.post<any>(usersApi + "/gamerunningroulette",d);

  }
  gamerunningtriplechance() {
    return this.http.get<any>(usersApi + "/gamerunningtriplechance");

  }
  Winamount(d) {
    return this.http.post<any>(usersApi + "/Winamount", d);

  }
  DeletePreviousWinamount(d) {
    return this.http.post<any>(usersApi + "/DeletePreviousWinamount", d);

  }
  //bet
  getbetroulette() {
    // return this.http.get<any>(usersApi + "/getbetroulette");
    return this.http.get<any>(usersApi + "/getbetrouletteValue");
  }
  getbetfuntarget() {
    return this.http.get<any>(usersApi + "/getbetfuntarget");

  }





  jokerBetPlaced(d) {
    return this.http.post<any>(usersApi + "/jokerBetPlaced", d);

  }
  jokerTakeAmount(d) {
    return this.http.post<any>(usersApi + "/jokerTakeAmount", d);

  }
  jokerDoubleUp(d) {
    return this.http.post<any>(usersApi + "/jokerDoubleUp", d);

  }
  bingoBetsPlaced(d) {
    return this.http.post<any>(usersApi + "/bingoBetsPlaced", d);

  }
  bingoDoubleUp(d) {
    return this.http.post<any>(usersApi + "/bingoDoubleUp", d);

  }
  bingoTakeAmount(d) {
    return this.http.post<any>(usersApi + "/bingoTakeAmount", d);

  }
  bingoGetBalance(d) {
    return this.http.post<any>(usersApi + "/bingoGetBalance", d);

  }
  //return this.http.post<any>(usersApi +"/sendPointsUsers", d );

  sendPointsUsers(d) {
    return this.http.post<any>(usersApi + "/sendPointsUsers", d);

  }
  DeleteUpdate(d) {
    return this.http.post<any>(usersApi + "/DeleteUpdate", d);

  }
  accpetPointsUser(d) {
    return this.http.post<any>(usersApi + "/accpetPointsUser", d);

  }
  transfer(d) {
    return this.http.post<any>(usersApi + "/transfer", d);

  }
  receive(d) {
    return this.http.post<any>(usersApi + "/receive", d);

  }
  getPlayerPoint(d) {
    return this.http.post<any>(usersApi + "/getPlayerPoint", d);

  }
  sendStateIdPoints(d) {
    return this.http.post<any>(usersApi + "/sendStateIdPoints", d);

  }
  sendMainIdPoints(d) {
    return this.http.post<any>(usersApi + "/sendMainIdPoints", d);

  }
  sendCityIdPoints(d) {
    return this.http.post<any>(usersApi + "/sendCityIdPoints", d);

  }
  sendPlayerIdPoints(d) {
    return this.http.post<any>(usersApi + "/sendPlayerIdPoints", d);

  }
  sendMiniIdPoints(d) {
    return this.http.post<any>(usersApi + "/sendMiniIdPoints", d);

  }
  getEmailsByManager(d) {
    return this.http.post<any>(usersApi + "/getEmailsByManager", d);

  }
  resetUserPassword(d) {
    return this.http.post<any>(usersApi + "/resetUserPassword", d);

  }
  rejectPoint(d) {
    return this.http.post<any>(usersApi + "/rejectPoint", d);

  }
  rejectPoint1(d) {
    return this.http.post<any>(usersApi + "/rejectPoint1", d);

  }

  cancelTransferableId(d) {
    return this.http.post<any>(usersApi + "/cancelTransferableId", d);

  }
  checkPointHistory(d) {
    return this.http.post<any>(usersApi + "/checkPointHistory", d);

  }
  PointTransferData(d) {
    return this.http.post<any>(usersApi + "/PointTransferData", d);

  }
  pendingReceive(d) {
    return this.http.post<any>(usersApi + "/pendingReceive", d);

  }
  rejectedPoint(d) {
    return this.http.post<any>(usersApi + "/rejectedPoint", d);

  }
  PointReceiveData(d) {
    return this.http.post<any>(usersApi + "/PointReceiveData", d);

  }
  PointCancelData(d) {
    return this.http.post<any>(usersApi + "/PointCancelData", d);

  }
  deleteMainId(d) {
    return this.http.post<any>(usersApi + "/deleteMainId", d);

  }


  getAdminDashBoard() {
    return this.http.get<any>(usersApi + "/getAdminDashboard");
  }
  updateVersion(d) {
    return this.http.post<any>(usersApi + "/updateVersion", d);
  }
  getVersion() {
    return this.http.get<any>(usersApi + "/getVersion");
  }
}
