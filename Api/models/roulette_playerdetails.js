const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const roulette_playerdetails_schema = new mongoose.Schema({
    RoundCount:Number,
    playername:String,
    winNo:Number,
    playedtime:{type:Date, default: Date.now },

});

roulette_playerdetails_schema.plugin(dataTables)
module.exports = mongoose.model('roulette_playerdetails', roulette_playerdetails_schema);
