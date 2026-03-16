const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const admin_roulette_schema = new mongoose.Schema({
    _id: Number,
    value:{type:Number, default:-1},
});

admin_roulette_schema.plugin(dataTables)
module.exports = mongoose.model('admin_roulette', admin_roulette_schema);
