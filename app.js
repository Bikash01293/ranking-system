const express = require('express');
const mongoose = require('mongoose');
const venueRoutes = require('./routes/venueRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});

app.use('/api', venueRoutes);

module.exports = app;