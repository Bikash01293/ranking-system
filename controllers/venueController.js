const venueService = require('../services/venueService');

async function getVenues(req, res) {
    try {
        const { userId, latitude, longitude } = req.query;
        const rankedVenues = await venueService.getRankedVenues(userId, latitude, longitude);
        // console.log(rankedVenues);
        res.json(rankedVenues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getVenues
};