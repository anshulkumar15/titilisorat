const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const isbetplacedroulette_schema = new mongoose.Schema({
    playerId :String,
});

isbetplacedroulette_schema.plugin(dataTables)
module.exports = mongoose.model('isbetplacedroulette', isbetplacedroulette_schema);
