const mongoose = require('mongoose');

const ManagerLedgerSchema = new mongoose.Schema({
  managerEmail: { type: String, unique: true, required: true },
  cumulativeLoss: { type: Number, default: 0 },
}, { timestamps: true }); // timestamps = createdAt + updatedAt

module.exports = mongoose.model("ManagerLedger", ManagerLedgerSchema);
