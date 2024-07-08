const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, required: true, unique: true },
    bottlesWeight: { type: Number, required: true },
    participants: { type: Number, required: true }
});

const Statistic = mongoose.model('Statistic', statisticSchema);

module.exports = Statistic;
