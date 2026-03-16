const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const funtarget_playerdetail_schema = new mongoose.Schema({
    RoundCount:Number,
    playername:String,
    winNo:Number,
     WinX:String,
    playedtime:{type:Date, default: Date.now }

});

funtarget_playerdetail_schema.plugin(dataTables)
module.exports = mongoose.model('funtarget_playerdetail', funtarget_playerdetail_schema);
