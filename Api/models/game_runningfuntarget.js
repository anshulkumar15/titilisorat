const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_runningfuntarget_schema = new mongoose.Schema({
    playername: String,
    RoundCount: Number,
    Zero: Number,
    One: Number,
    Two: Number,
    Three: Number,
    Four: Number,
    Five: Number,
    Six: Number,
    Seven: Number,
    Eight: Number,
    Nine: Number,
    Ten:Number,
    Eleven:Number,

    winpoint: Number,
    Win_singleNo: Number,
    winX: Number,
    playedTime: {type:Date },
    betpoint:Number,
    idManager:String,
 
});

game_runningfuntarget_schema.plugin(dataTables)
module.exports = mongoose.model('game_runningfuntarget', game_runningfuntarget_schema);
