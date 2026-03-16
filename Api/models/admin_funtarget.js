const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const admin_funtarget_schema = new mongoose.Schema({
    _id: Number,
    value:{type:Number, default:-1},
     winType: {
    type: String,
    enum: ['Random Win', 'Min Bet Win', 'Max Bet Win', 'Selected Option Win'],
    required: true,
    default:'Random Win'
  },
  selectedOption: {
    type: mongoose.Schema.Types.Mixed, // Can be number (0–11) or string like "random_win"
    default: 'random_win'
  },
  targetAmount: { type: Number, default: 0 },
  startDate: { type: String },
  endDate: { type: String },
  adminProfit: { type: Number, default: 0 } // Added to track cumulative player losses
});

admin_funtarget_schema.plugin(dataTables)
module.exports = mongoose.model('admin_funtarget', admin_funtarget_schema);
