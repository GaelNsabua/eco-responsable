const cron = require('node-cron');
const Challenge = require('../models/challenge');
const User = require('../models/users');

const endChallenge = async () => {
    try {
        const currentChallenge = await Challenge.findOne({ isActive: true, endDate: { $lte: new Date() } });
        if (!currentChallenge) return;

        const sortedParticipants = currentChallenge.participants.sort((a, b) => b.weight - a.weight).slice(0, 10);

        for (let i = 0; i < sortedParticipants.length; i++) {
            const participant = sortedParticipants[i];
            const user = await User.findById(participant.user);

            if (user) {
                const reward = (10 - i) * 10; // Example reward calculation
                user.profit += reward;
                user.accumulation += reward;
                await user.save();
            }
        }

        currentChallenge.isActive = false;
        await currentChallenge.save();

        await User.updateMany(
            { _id: { $in: currentChallenge.participants.map(p => p.user) } },
            { $set: { BottlesCollectedWeight: 0, profit: 0 } }
        );

    } catch (err) {
        console.error('Error ending challenge:', err);
    }
};

cron.schedule('0 0 * * *', endChallenge);

module.exports = endChallenge;
