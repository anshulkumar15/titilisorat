const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const PlayerPollSchema = new mongoose.Schema({

    room_id:Number,
    game_id:Number,
    joker_card_no:Number,
    spot1:Number,
    spot2:Number,
    modified:Date,
    created:Date,


} );

PlayerPollSchema.plugin(dataTables)
module.exports = mongoose.model('game_record_newandarbhar', PlayerPollSchema);
