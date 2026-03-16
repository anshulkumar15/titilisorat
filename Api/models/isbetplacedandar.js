const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const isbetplacedandar_schema = new mongoose.Schema({
    playerId :String,
});

isbetplacedandar_schema.plugin(dataTables)
module.exports = mongoose.model('isbetplacedandar', isbetplacedandar_schema);
