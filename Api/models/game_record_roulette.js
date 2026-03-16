const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_record_roulette_schema = new mongoose.Schema({
    room_id:String,
    game_id:String,
    winNo1:String,
    winNo2:String,
    spot:String,
    
},{
    timestamps: true,
});

game_record_roulette_schema.plugin(dataTables)
module.exports = mongoose.model('game_record_roulette', game_record_roulette_schema);
