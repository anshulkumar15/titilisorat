const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const aviator_bet_schema = new mongoose.Schema({
    _id: Number,
    total_bet:{type:Number, default:0},
    
});

aviator_bet_schema.plugin(dataTables)
module.exports = mongoose.model('aviator_bet', aviator_bet_schema);
