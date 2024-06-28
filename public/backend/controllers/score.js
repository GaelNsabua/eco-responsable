const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Score = require('../models/score');

// Get user's score
router.get('/', auth, async (req, res) => {
    try {
        const score = await Score.findOne({ user: req.user.id });

        if (!score) {
            return res.status(400).json({ error: 'No score found for this user' });
        }

        res.json(score);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user's score (Admin only)
router.post('/update', auth, auth.isAdmin, async (req, res) => {
    const { userId, bottlesCollected } = req.body;

    try {
        let score = await Score.findOne({ user: userId });

        if (!score) {
            score = new Score({
                user: userId,
                bottlesCollected
            });
        } else {
            score.bottlesCollected += bottlesCollected;
        }

        await score.save();

        res.json(score);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
