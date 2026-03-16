const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_running_schema = new mongoose.Schema({
    RoundCount:String,
    playername:String,
    singleNo:Number,
    doubleNo:Number,
    tripleNo:Number,
     winpoint:Number,
    Win_finalNo:Number,
    playerTime:{type:Date, default: Date.now },

});

game_running_schema.plugin(dataTables)
module.exports = mongoose.model('game_running_sevenup', game_running_schema);
