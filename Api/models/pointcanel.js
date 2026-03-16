const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const pointcanel_Schema = new mongoose.Schema({
    Cancel_time:{type:Date, default: Date.now },
    Amount:Number,
    Type:String,
    Tranferred_to:String
});

pointcanel_Schema.plugin(dataTables)
module.exports = mongoose.model('pointcanel', pointcanel_Schema);
