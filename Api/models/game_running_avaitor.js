const mongoose = require('mongoose');
const game_running_aviator_schema = new mongoose.Schema({
    playername: String,
    RoundCount: Number,
    winpoint: Number,
    Win_singleNo: Number,

    winX: Number,
    playedTime: {type:Date },
    betpoint:Number,
    idManager:String,
});

 
module.exports = mongoose.model('game_running_avaitor', game_running_aviator_schema);
