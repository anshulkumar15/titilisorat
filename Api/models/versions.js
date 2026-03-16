const mongoose = require('mongoose');
var dataTables = require('mongoose-datatables')

const VersionSchema = new mongoose.Schema({
    _id: Number,
    versionControle: {
        type: String
    },
    appLink: {
        type: String
    },

    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    active: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true,
});

VersionSchema.plugin(dataTables)

module.exports = mongoose.model('versions', VersionSchema);