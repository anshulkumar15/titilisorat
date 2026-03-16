const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const seven_playerdetail_schema = new mongoose.Schema({
    RoundCount:Number,
    playername:String,
    dice1:Number,
    dice2:Number,
    wintype:String,
    playedtime:{type:Date, default: Date.now },

});

seven_playerdetail_schema.plugin(dataTables)
module.exports = mongoose.model('seven_playerdetail', seven_playerdetail_schema);
