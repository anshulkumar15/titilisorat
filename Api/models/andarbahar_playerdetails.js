const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const andarbahar_playerdetails_schema = new mongoose.Schema({
    RoundCount:Number ,
    playername:String ,
    Cardresult:Number ,
    finalresult :Number ,
    playedtime:{type:Date, default: Date.now } ,

});

andarbahar_playerdetails_schema.plugin(dataTables)
module.exports = mongoose.model('andarbahar_playerdetails', andarbahar_playerdetails_schema);
