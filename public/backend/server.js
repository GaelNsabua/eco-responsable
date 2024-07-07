const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const userRoutes = require('./routes/users');
const historyRoutes = require('./routes/history');
const reportRoutes = require('./routes/report');

app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/report', reportRoutes);


// Global error handler
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
