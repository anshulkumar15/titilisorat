const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const PlayerPollSchema = new mongoose.Schema({
    _id: Number,
    Card_A_amount :String ,
    Card_2_amount :String ,
    Card_3_amount :String ,
    Card_4_amount:String ,
    Card_5_amount:String ,
    Card_6_amount:String ,
    Card_7_amount:String ,
    Card_8_amount:String ,
    Card_9_amount:String ,
    Card_10_amount:String ,
    Card_J_amount:String ,
    Card_Q_amount:String ,
    Card_K_amount:String ,
    Card_Heart_amount:String ,
    Card_Diamond_amount:String ,
    Card_Club_amount:String ,
    Card_Spade_amount:String ,
    Card_Red_amount:String ,
    Card_Black_amount:String ,
    Card_A_6_amount:String ,
    Card_seven_amount:String ,
    Card_8_K_amount:String ,
    Card_Andhar_amount :String ,
    Card_Bahar_amount:String ,


});

PlayerPollSchema.plugin(dataTables)
module.exports = mongoose.model('andarbahar_bet', PlayerPollSchema);
