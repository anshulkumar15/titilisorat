const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const triplechance_bet_schema = new mongoose.Schema({
    _id: Number,
    singleNo:String,
    doubleNo:String,
    tripleNo:String,
});

triplechance_bet_schema.plugin(dataTables)
module.exports = mongoose.model('triplechance_bet', triplechance_bet_schema);
