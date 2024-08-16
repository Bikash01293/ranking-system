const User = require('../models/User');
const Venue = require('../models/Venue');
const Ad = require('../models/Ad');
const cacheService = require('./cacheService');

async function getRankedVenues(userId, userLat, userLong) {
    // console.log('Starting getRankedVenues with userId:', userId);

    const cacheKey = `venues_${userId}`;

    // Check Redis cache
    let cachedVenues;
    try {
        // console.log('Attempting to get cache');
        cachedVenues = await cacheService.getCache(cacheKey);
        // console.log('Cache retrieval complete:', cachedVenues ? 'Cache hit' : 'Cache miss');
    } catch (err) {
        console.error('Error fetching cache:', err);
        throw err;
    }

    if (cachedVenues) {
        console.log('Returning cached data');
        return cachedVenues;
    }

    // Fetch user data
    let user;
    try {
        // console.log('Fetching user data');
        user = await User.findById(userId);
        // console.log('User data fetched:', user);
    } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
    }
    
    if (!user) {
        throw new Error('User not found');
    }

    // Fetch venues and ads
    let venues, ads;
    try {
        // console.log('Fetching venues');
        venues = await Venue.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLong, userLat]
                    },
                    $maxDistance: 5000
                }
            }
        });

        // console.log('User Location:', userLat, userLong);

        // console.log('Fetching ads');
        ads = await Ad.find({
            zone: {
                $geoIntersects: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [userLong, userLat]
                    }
                }
            },
            associatedSports: { $in: user.preferredSports }
        });

        // console.log('Venues data fetched:', venues.length);
        // console.log('Ads data fetched:', ads.length);
        // console.log('Ads:', ads);
    } catch (err) {
        console.error('Error fetching venues or ads:', err);
        throw err;
    }

    // Rank venues based on user preferences and other criteria
    let rankedVenues;
    try {
        console.log('Ranking venues');
        rankedVenues = venues.map(venue => {
            const isPreferredSport = venue.availableSports.some(sport => user.preferredSports.includes(sport));
            const venueObject = venue.toObject ? venue.toObject() : venue;
            return {
                ...venueObject,
                rank: (isPreferredSport ? 10 : 0) - venueObject.rating * 2
            };
        }).sort((a, b) => b.rank - a.rank); // Sort in descending order
        // console.log('Ranked Venues:', rankedVenues);
    } catch (err) {
        console.error('Error ranking venues:', err);
        throw err;
    }

    // Prepare ad insertion
    let result = [];
    let venueIndex = 0;

    try {
        // console.log('Preparing ad insertion');
        ads.forEach(ad => {
            // Insert venues up to the current ad's insertion position
            while (venueIndex < ad.insertionPosition && venueIndex < rankedVenues.length) {
                result.push(rankedVenues[venueIndex]);
                venueIndex++;
            }
            // Insert the ad
            result.push({ adContent: ad.content });
        });

        // Insert any remaining venues after the last ad
        while (venueIndex < rankedVenues.length) {
            result.push(rankedVenues[venueIndex]);
            venueIndex++;
        }

        // Remove rank attribute from venues in the result
        result = result.map(item => {
            if (item._id) {
                const { rank, ...venue } = item;
                return venue;
            }
            return item;
        });

        // console.log('Ad insertion completed:', result);
    } catch (err) {
        console.error('Error preparing ad insertion:', err);
        throw err;
    }

    // Cache and return results
    try {
        // console.log('Setting cache');
        await cacheService.setCache(cacheKey, result);
        // console.log('Cache set successfully');
    } catch (err) {
        console.error('Error setting cache:', err);
        throw err;
    }
    
    return result;
}

module.exports = {
    getRankedVenues
};