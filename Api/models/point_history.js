const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const point_history_Schema = new mongoose.Schema({
    sender:String,
    receiver:String,
    point:Number,
    state:String,
    status:Number,
    createdat:{type:Date, default: Date.now }
});

point_history_Schema.plugin(dataTables)
module.exports = mongoose.model('point_history', point_history_Schema);
