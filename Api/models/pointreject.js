const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const pointrejectSchema = new mongoose.Schema({
    FromAccountName:String,
    point:Number,
    ToAccountName:String
}, {
    timestamps: true,
});

pointrejectSchema.plugin(dataTables)
module.exports = mongoose.model('pointreject', pointrejectSchema);
