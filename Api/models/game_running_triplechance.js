const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_running_triplechance_schema = new mongoose.Schema({
    RoundCount:String,
    playername:String,
    singleNo:String,
    doubleNo:String,
    tripleNo:String,
    singleVal:String,
    doubleVal:String,
    winpoint:String,
    Win_singalNo:Number,
    playedTime:{type:Date, default: Date.now },

});

game_running_triplechance_schema.plugin(dataTables)
module.exports = mongoose.model('game_running_triplechance', game_running_triplechance_schema);
