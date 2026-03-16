const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_running_andarbahar_schema = new mongoose.Schema({
   
    playername:String, RoundCount:String,
    Card_A_amount :String,
  Card_2_amount :String,
  Card_3_amount :String,
  Card_4_amount:String,
  Card_5_amount:String,
  Card_6_amount:String,
  Card_7_amount:String,
  Card_8_amount:String,
  Card_9_amount:String,
  Card_10_amount:String,
  Card_J_amount:String,
  Card_Q_amount:String,
  Card_K_amount:String,
  Card_Heart_amount:String,
  Card_Diamond_amount:String,
  Card_Club_amount:String,
  Card_Spade_amount:String,
  Card_Red_amount:String,
  Card_Black_amount:String,
  Card_A_6_amount:String,
  Card_seven_amount:String,
  Card_8_K_amount:String,
  Card_Andhar_amount :String,
  Card_Bahar_amount:String,
  winpoint:Number,
  betpoint:Number,
  Win_singleNo:Number,
  idManager:String,
  playedTime:{type:Date },

});

game_running_andarbahar_schema.plugin(dataTables)
module.exports = mongoose.model('game_running_andarbahar', game_running_andarbahar_schema);
