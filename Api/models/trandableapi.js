const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const TransferSchema = new mongoose.Schema({
    role_id:Number,
    FromAccountName:String,
    point:Number,
    ToAccountName:String,
    status:{
        type: String,
        enum : ['P','R'],
        default: 'P'
}
}, {
    timestamps: true,
});

TransferSchema.plugin(dataTables)
module.exports = mongoose.model('trandableapi', TransferSchema);
