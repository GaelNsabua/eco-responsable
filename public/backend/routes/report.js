const express = require('express');
const router = express.Router();
const User = require('../models/users');
const auth = require('../middleware/auth');

// Route to get global statistics
router.get('/global', async (req, res) => {
    try {
        // Find all users who are not administrators
        const users = await User.find({ isAdmin: false });

        // Calculate the statistics
        const totalUsers = users.length;
        const totalWeight = users.reduce((acc, user) => acc + user.BottlesCollectedWeight, 0);
        const totalAccumulation = users.reduce((acc, user) => acc + user.accumulation, 0);

        // Send the statistics in the response
        res.json({ totalUsers, totalWeight, totalAccumulation });
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

module.exports = router;
