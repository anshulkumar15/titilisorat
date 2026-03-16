const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const isbetplaced_avaiator_schema = new mongoose.Schema({
    playerId :String,
});

module.exports = mongoose.model('isbetplaced_aviator', isbetplaced_avaiator_schema);
