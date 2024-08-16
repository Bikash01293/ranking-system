const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    preferredSports: [{ type: String, required: true }]
});

// Create a geospatial index on location
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);