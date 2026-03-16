const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_result_aviator_schema = new mongoose.Schema({
    room_id:String,
    game_id:String,
    Win_singleNo: Number,
},{
    timestamps: true,
});

game_result_aviator_schema.plugin(dataTables)
module.exports = mongoose.model('game_result_aviator', game_result_aviator_schema);
