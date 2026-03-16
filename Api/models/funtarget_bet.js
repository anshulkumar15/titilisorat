const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')
const PlayerPollSchema = new mongoose.Schema({
  _id: Number,
    BetOnZero:{  type: Number,default: 0, required :true},
  BetOnOne:{  type: Number,default: 0, required :true},
  BetOnTwo:{  type: Number,default: 0, required :true},
  BetOnThree:{  type: Number,default: 0, required :true},
  BetOnFour:{  type: Number,default: 0, required :true},
  BetOnFive:{  type: Number,default: 0, required :true},
  BetOnSix:{  type: Number,default: 0, required :true},
  BetOnSeven:{  type: Number,default: 0, required :true},
  BetOnEight:{  type: Number,default: 0, required :true},
  BetOnNine:{  type: Number,default: 0, required :true},
  BetOnTen:{  type: Number,default: 0, required :true},
  BetOnEleven:{  type: Number,default: 0, required :true},
  Winx:{  type: Number,default: 0, required :true},
});

PlayerPollSchema.plugin(dataTables)
module.exports = mongoose.model('funtarget_bet', PlayerPollSchema);
