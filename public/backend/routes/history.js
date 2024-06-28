const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const History = require('../models/history');

// Get score adjustment history (Admin only)
router.get('/adjustments', auth, auth.isAdmin, async (req, res) => {
    try {
        const adjustments = await History.find().populate('userId', 'username').populate('adminId', 'username').sort('-adjustmentDate');
        res.json(adjustments);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;