const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    statusCode: {
        type: Number,
        required: true
    },
    status: {
        type: String
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Report', reportSchema);