const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const PlayerPollSchema = new mongoose.Schema({

    FromAccountName:String,
    ToAccountName:String,
    Amount:Number,
}, {
    timestamps: true,
});

PlayerPollSchema.plugin(dataTables)
module.exports = mongoose.model('rejectedpoint_record', PlayerPollSchema);
