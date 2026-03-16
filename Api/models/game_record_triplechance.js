const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_record_triplechance_schema = new mongoose.Schema({
    room_id:String,
    game_id:String,
    spot:Number,
    winNo1:Number,
    tripleNo:Number,
    winNo2:Number,
    
},{
    
});

game_record_triplechance_schema.plugin(dataTables)
module.exports = mongoose.model('game_record_triplechance', game_record_triplechance_schema);
