const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const isbetplaced_schema = new mongoose.Schema({
    playerId :String,
});

isbetplaced_schema.plugin(dataTables)
module.exports = mongoose.model('isbetplaced', isbetplaced_schema);
