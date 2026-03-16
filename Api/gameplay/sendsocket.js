//const SendSocketToSvenUP = require("./Sevenup").GetSocket;
//const SendSocketToDvT = require("./DragonVsTiger").GetSocket;
//const SendSocketToTitali = require("./TitaliGame").GetSocket;
//const SendSocketToLucky = require("./LuckyBall").GetSocket;
const SendSocketToRoulette = require("./Roulette").GetSocket;
const SendSocketToFunTareget = require("./FunTarget").GetSocket;
const SendSocketToNewAndarbharGame = require("./NewAndarbhar").GetSocket;

//const SendSocketToTripleChance = require("./TripleChance").GetSocket;
//const SendSocketToAndarbhar = require("./Andarbhar").GetSocket;

const SendSocketToAviator = require("./Aviator").GetSocket;

function sendSocket(socket) {

  //  SendSocketToDvT(socket)
  //  SendSocketToAndarbhar(socket)
  //  SendSocketToTitali(socket)
  //  SendSocketToLucky(socket)
  //  SendSocketToTripleChance(socket);
  //  SendSocketToSvenUP(socket);

   SendSocketToFunTareget(socket);
   SendSocketToRoulette(socket);
   SendSocketToNewAndarbharGame(socket);
   SendSocketToAviator(socket)
}

module.exports.sendSocket = sendSocket;
