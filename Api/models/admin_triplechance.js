const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const admin_triplechance_schema = new mongoose.Schema({
    _id: Number,
    value1:{type:Number, default:-1},
    value2:{type:Number, default:-1},
    value3:{type:Number, default:-1},


});

admin_triplechance_schema.plugin(dataTables)
module.exports = mongoose.model('admin_triplechance', admin_triplechance_schema);
