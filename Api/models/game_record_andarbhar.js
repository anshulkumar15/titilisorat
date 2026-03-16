const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_record_andarbhar_schema = new mongoose.Schema({
    room_id:Number,
    game_id:Number,
    joker_card_no:Number,
    spot1:Number,
    spot2:Number,
    
},{
    timestamps: true,
});

game_record_andarbhar_schema.plugin(dataTables)
module.exports = mongoose.model('game_record_andarbhar', game_record_andarbhar_schema);
