const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const isbetplacedfun_schema = new mongoose.Schema({
    playerId :String,
});

isbetplacedfun_schema.plugin(dataTables)
module.exports = mongoose.model('isbetplacedfun', isbetplacedfun_schema);
