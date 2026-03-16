const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const join_game = new mongoose.Schema({
    user_id:{type: String },
    game_id:{type: String },
    room_id:{type: String },
    amount:{type: Number },
    win_amount:{type: Number },
    spot:{type: Number },
    is_updated:{type: Number },
    modified:{type:Date},
    created:{type:Date, default: Date.now }
} );

join_game.plugin(dataTables)
module.exports = mongoose.model('join_game', join_game);
