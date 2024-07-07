const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/users');
const history = require('../models/history');

// User registration
router.post('/register', async (req, res) => {
    const { username, password, commune } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        user = new User({
            username,
            password,
            commune
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (Admin only)
router.get('/', auth, auth.isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user's score (Admin only)
router.post('/update-score', auth, auth.isAdmin, async (req, res) => {
    const { userId, BottlesCollectedWeight, userWithdrawal } = req.body;

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const previousBottlesCollectedWeight = user.BottlesCollectedWeight;
        const previouswithdrawal = user.withdrawal;
        const previousprofit = user.profit;
        const previousaccumulation = user.accumulation;

        user.BottlesCollectedWeight = user.BottlesCollectedWeight+BottlesCollectedWeight; //On update le poids des bouteilles collectés en additionnant
        user.score = ((user.BottlesCollectedWeight)/1000) 
        user.profit = user.profit + ((BottlesCollectedWeight*5000)/2.5); // Calcul du gain en considerant que 2.5Kg de bouteilles equivalent à 5000fc et on update le profit en additionnant
        user.profit = (user.profit - userWithdrawal); //On soustrait le retrait dans le profit afin de trouver le gain courant
        //Le gain courant ne peut pas être inferieur à 500 après calcul
        if (user.profit < 500) {
            return res.status(400).json({ error: 'user profit is not sufficient' });
        }

        user.withdrawal = user.withdrawal + userWithdrawal; //On update le retrait
        user.accumulation = user.withdrawal + user.profit; //On adapte le gain cumulé avant de soustraire le retrait dans le profit
        //user.date = Date.now; //On update la date de modification

        await user.save(); //Enregistrement de l'utilisateur dans la base de donnée avec les nouvelles informations

        //A ce niveau on sauvegarde l'historique des modififications
        const adjustment = new history({
            userId: user._id,
            adminId: req.user.id,
            previousBottlesCollectedWeight,
            newBottlesCollectedWeight: BottlesCollectedWeight,
            previouswithdrawal,
            newWithdrawal: user.withdrawal,
            previousprofit,
            newprofit: user.profit,
            previousaccumulation,
            newaccumulation: user.accumulation
        });

        await adjustment.save();

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user info
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
