const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_record_funtarget_schema = new mongoose.Schema({
    room_id:String,
    game_id:String,
    spot:String,
    winNo1:String,
    winNo2:String,
    
  
},{
    timestamps: true,
});

game_record_funtarget_schema.plugin(dataTables)
module.exports = mongoose.model('game_record_funtarget', game_record_funtarget_schema);
