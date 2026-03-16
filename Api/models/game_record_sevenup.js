const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const game_record_triplechance_schema = new mongoose.Schema({
    room_id:String,
    game_id:String,
    win_no:String,
    spot:String,
    created:String,
    modified:String,
});

game_record_triplechance_schema.plugin(dataTables)
module.exports = mongoose.model('game_record_sevenup', game_record_triplechance_schema);
