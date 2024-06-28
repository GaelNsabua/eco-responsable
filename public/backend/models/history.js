const mongoose = require('mongoose');

const HystorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousGoodBottlesCollected: { type: Number, required: true },
    newGoodBottlesCollected: { type: Number, required: true },
    previousBadBottlesCollected: { type: Number, default: 0 },
    newBadBottlesCollected: { type: Number, default: 0 },
    previouswithdrawal:{ type: Number, default: 0 },
    newWithdrawal:{ type: Number, default: 0 },
    previousprofit:{ type: Number, default: 0 },
    newprofit:{ type: Number, default: 0 },
    previousaccumulation:{ type: Number, default: 0 },
    newaccumulation:{ type: Number, default: 0 },
    adjustmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('history', HystorySchema);
