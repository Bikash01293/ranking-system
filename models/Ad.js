const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    zone: {
        type: {
            type: String,
            enum: ['Polygon'],
            required: true
        },
        coordinates: {
            type: [[[Number]]], // Ensure correct 2D array type
            required: true
        }
    },
    associatedSports: [{ type: String, required: true }],
    insertionPosition: { type: Number, required: true },
    content: { type: String, required: true }
});

AdSchema.index({ zone: '2dsphere' });

module.exports = mongoose.model('Ad', AdSchema);