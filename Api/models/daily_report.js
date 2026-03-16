const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const daily_report = new mongoose.Schema({
    idManager:{type: String },
    user_email:{type: String },
    user_profit:{type: Number ,default: 0},
    agent_profit:{type: Number,default: 0},
    comission_status:{type: String, default: 'pending' },
    day:{type:Date},
    role_id:{type: Number , default:4},
 } );

 daily_report.plugin(dataTables)
module.exports = mongoose.model('daily_report', daily_report);
