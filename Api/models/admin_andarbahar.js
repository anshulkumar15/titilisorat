const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const admin_andarbahar_schema = new mongoose.Schema({
    _id: Number,
    value:{type:Number, default:-1},
} );

admin_andarbahar_schema.plugin(dataTables)
module.exports = mongoose.model('admin_andarbahar', admin_andarbahar_schema);
