const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const admin_aviator_schema = new mongoose.Schema({
    _id: Number,
    value:{type:Number, default:-1},
});

module.exports = mongoose.model('admin_aviator', admin_aviator_schema);
