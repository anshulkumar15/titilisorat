const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const winpoint_details_schema = new mongoose.Schema({
    
    playerId:String ,
    game_id:Number ,
    point:Number,
    
},{
    timestamps: true,
});

winpoint_details_schema.plugin(dataTables)
module.exports = mongoose.model('winpoint_details', winpoint_details_schema);
