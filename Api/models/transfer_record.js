const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const TranferRecordSchema = new mongoose.Schema({
    role_id:Number,
    FromAccountName:String,
    ToAccountName:String,
    point:Number,
    type:{type:String ,default:'P',
        enum: ['P', 'G']},
    Date:{type:Date, default: Date.now }

} );

TranferRecordSchema.plugin(dataTables)
module.exports = mongoose.model('transfer_record', TranferRecordSchema);
