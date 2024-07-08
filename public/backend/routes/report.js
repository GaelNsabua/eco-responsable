const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Statistic = require('../models/statistic');
const auth = require('../middleware/auth');

// Function to calculate global statistics
async function calculateGlobalStatistics() {
    const users = await User.find({ isAdmin: false });

    const totalUsers = users.length;
    const totalWeight = users.reduce((acc, user) => acc + user.BottlesCollectedWeight, 0);
    const totalAccumulation = users.reduce((acc, user) => acc + user.accumulation, 0);

    return { totalUsers, totalWeight, totalAccumulation };
}

// Route to get global statistics
router.get('/global', async (req, res) => {
    try {
        const statistics = await calculateGlobalStatistics();
        res.json(statistics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route pour récupérer les statistiques d'un utilisateur spécifique
router.get('/user/:userId', auth, auth.isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            username: user.username,
            commune: user.commune,
            score: user.score,
            BottlesCollectedWeight: user.BottlesCollectedWeight,
            withdrawal: user.withdrawal,
            profit: user.profit,
            accumulation: user.accumulation
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to get statistics by commune
router.get('/commune', auth, async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false });

        const communes = [
            'Annexe',
            'Kamalondo',
            'Kampemba',
            'Katuba',
            'Kenya',
            'Lubumbashi',
            'Rwashi'
        ];

        const statsByCommune = communes.map(commune => {
            const usersInCommune = users.filter(user => user.commune === commune);
            const totalUsers = usersInCommune.length;
            const totalWeight = usersInCommune.reduce((acc, user) => acc + user.BottlesCollectedWeight, 0);
            const totalProfits = usersInCommune.reduce((acc, user) => acc + user.profit, 0);
            return {
                commune,
                totalUsers,
                totalWeight,
                totalProfits
            };
        });

        res.json(statsByCommune);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Route to get statistics for graph representation
router.get('/statistics', auth, async (req, res) => {
    try {
        // Find all statistics entries and sort by date
        const statistics = await Statistic.find().sort('date');

        // Format the statistics
        const formattedStatistics = statistics.map(stat => ({
            date: stat.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            bottlesWeight: stat.bottlesWeight,
            participants: stat.participants
        }));

        // Send the formatted statistics in the response
        res.json(formattedStatistics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to update global statistics
router.post('/update-statistics', auth, async (req, res) => {
    try {
        const newStatistics = await calculateGlobalStatistics();
        
        // Fetch the latest statistics entry from the database
        const latestStatistic = await Statistic.findOne().sort('-date');

        // Check if there are any changes in the statistics
        if (!latestStatistic ||
            latestStatistic.bottlesWeight !== newStatistics.totalWeight ||
            latestStatistic.participants !== newStatistics.totalUsers) {
                
            // Save new statistics
            const newStatisticEntry = new Statistic({
                date: new Date(),
                bottlesWeight: newStatistics.totalWeight,
                participants: newStatistics.totalUsers
            });

            await newStatisticEntry.save();

            res.status(201).json({ message: 'Statistics updated successfully' });
        } else {
            res.status(200).json({ message: 'No changes in statistics' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
