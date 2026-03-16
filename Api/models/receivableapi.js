const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const PlayerPollSchema = new mongoose.Schema({
    FromAccountName:String,
    point:Number,
    ToAccountName:String
}, {
    timestamps: true,
});

PlayerPollSchema.plugin(dataTables)
module.exports = mongoose.model('receivableapi', PlayerPollSchema);
