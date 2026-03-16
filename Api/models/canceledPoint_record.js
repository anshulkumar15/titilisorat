const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const PlayerPollSchema = new mongoose.Schema({

    FromAccountName:String,
    Amount:Number,
    ToAccountName:String,
CancellationDate:{type:Date, default: Date.now }

});

PlayerPollSchema.plugin(dataTables)
module.exports = mongoose.model('canceledPoint_record', PlayerPollSchema);
