const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const admin_7up_schema = new mongoose.Schema({
    _id: Number,
    value1:{type:Number, default:-1},
    value2:{type:Number, default:-1},
});

admin_7up_schema.plugin(dataTables)
module.exports = mongoose.model('admin_7up', admin_7up_schema);
