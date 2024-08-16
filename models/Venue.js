const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
    name: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' } // Add index here
    },
    availableSports: [String],
    rating: Number
});

// Ensure the index is created
VenueSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Venue', VenueSchema);