const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const triplechance_playerdetail_schema = new mongoose.Schema({
    RoundCount:Number,
    playername:String,
    singleNo:Number,
    doubleNo:Number,
    tripleNo:Number,
    winNo:Number,
    playedtime:{type:Date, default: Date.now },

});

triplechance_playerdetail_schema.plugin(dataTables)
module.exports = mongoose.model('triplechance_playerdetail', triplechance_playerdetail_schema);
