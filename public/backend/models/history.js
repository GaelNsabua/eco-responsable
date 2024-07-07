const mongoose = require('mongoose');

const HystorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousBottlesCollectedWeight: { type: Number, required: true },
    newBottlesCollectedWeight: { type: Number, required: true },
    previouswithdrawal:{ type: Number, default: 0 },
    newWithdrawal:{ type: Number, default: 0 },
    previousprofit:{ type: Number, default: 0 },
    newprofit:{ type: Number, default: 0 },
    previousaccumulation:{ type: Number, default: 0 },
    newaccumulation:{ type: Number, default: 0 },
    adjustmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('history', HystorySchema);
