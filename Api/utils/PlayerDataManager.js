const debug = require("debug")("test");
let Players=[]

function AddPlayer(data){
Players.push(data)
//   console.log("new player add");
//   console.log(data)
}
function RemovePlayer(socketId){

  for (let i = 0; i < Players.length; i++) {
   if(Players[i].socketId===socketId){
       console.log(Players[i].playerId +"player removed")
    Players.splice(i,1);
    return;
   }
   //  console.log("player not found");
  }
}
function GetPlayerData(socketId){
  for (let i = 0; i < Players.length; i++) {
    if(Players[i].socketId===socketId){
      return Players[i];
    }    
  }
  return null;
}


  module.exports.AddPlayer=AddPlayer;
  module.exports.RemovePlayer=RemovePlayer;
  module.exports.GetPlayerData=GetPlayerData;