const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const pointtransferredSchema = new mongoose.Schema({
    FromAccountName:String,
    point:Number,
    ToAccountName:String
}, {
    timestamps: true,
});

pointtransferredSchema.plugin(dataTables)
module.exports = mongoose.model('pointtransferred', pointtransferredSchema);
