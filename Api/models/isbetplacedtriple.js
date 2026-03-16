const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const isbetplacedtriple_schema = new mongoose.Schema({
    playerId :String,
});

isbetplacedtriple_schema.plugin(dataTables)
module.exports = mongoose.model('isbetplacedtriple', isbetplacedtriple_schema);
