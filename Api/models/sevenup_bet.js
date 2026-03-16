const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const sevenup_bet_schema = new mongoose.Schema({
    _id: Number,
    two_six :Number,
    seven:Number,
    eight_twelve:Number
});

sevenup_bet_schema.plugin(dataTables)
module.exports = mongoose.model('sevenup_bet', sevenup_bet_schema);
