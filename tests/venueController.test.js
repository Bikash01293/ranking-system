const mongoose = require('mongoose');
const cacheService = require('../services/cacheService');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Ad = require('../models/Ad');
const venueService = require('../services/venueService');
require('dotenv').config();

describe('Venue API', () => {
    let userId;
    let venueId1;
    let venueId2;
    let adId;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI);
        mongoose.connection.once('open', () => {
            console.log('Connected to MongoDB');
        });
        jest.setTimeout(10000);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        await cacheService.disconnectRedis();
    });

    beforeEach(async () => {
        userId = new mongoose.Types.ObjectId();
        venueId1 = new mongoose.Types.ObjectId();
        venueId2 = new mongoose.Types.ObjectId();
    
        await User.create({
            _id: userId,
            name: 'Test User',
            preferredSports: ['Cricket'],
            location: { type: 'Point', coordinates: [38.8800, -77.0500] }
        });
    
        await Venue.create([
            {
                _id: venueId1,
                name: "test1",
                location: { type: 'Point', coordinates: [38.8800, -77.0500] },
                availableSports: ['Cricket'],
                rating: 5
            },
            {
                _id: venueId2,
                name: "test2",
                location: { type: 'Point', coordinates: [-77.0300, 38.8800] },
                availableSports: ['Football'],
                rating: 3
            }
        ]);

        const ad = await Ad.create({
            zone: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-77.0500, 38.8800],
                        [-77.0300, 38.8800],
                        [-77.0300, 38.8900],
                        [-77.0500, 38.8900],
                        [-77.0500, 38.8800]
                    ]
                ]
            },
            associatedSports: ['Tennis'],
            insertionPosition: 1,
            content: 'Get 20% off on tennis rackets!'
        });

        adId = ad._id;
    });

    afterEach(async () => {
        try {
            if (userId) {
                await User.findByIdAndDelete(userId);
            }
            if (venueId1) {
                await Venue.findByIdAndDelete(venueId1);
            }
            if (venueId2) {
                await Venue.findByIdAndDelete(venueId2);
            }
            if (adId) {
                await Ad.findByIdAndDelete(adId);
            }
        } catch (error) {
            console.error('Error cleaning up test data:', error);
        }
    });    

    it('should rank venues and insert ads', async () => {
        const result = await venueService.getRankedVenues(userId, 38.8800, -77.0500);
        // console.log('Test Result:', JSON.stringify(result, null, 2));
        const expectedVenue = {
            _id: venueId2,
            name: "test2",
            location: {
                type: 'Point',
                coordinates: [-77.0300, 38.8800]
            },
            availableSports: ['Football'],
            rating: 3
        };

        const expectedAd = {
            content: 'Get 20% off on tennis rackets!'
        };

        // Verify the result
        if (result.length === 1) {
            expect(result[0]).toMatchObject(expectedVenue);
        } else if (result.length === 2) {
            // If ad and venue both are returned
            expect(result[0]).toMatchObject(expectedVenue);
            expect(result[1]).toMatchObject(expectedAd);
        } else {
            throw new Error('Unexpected result format');
        }
    });
});