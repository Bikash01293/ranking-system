const sinon = require('sinon');
const { expect } = require('chai');
const venueService = require('../services/venueService');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Ad = require('../models/Ad');
const cacheService = require('../services/cacheService');

describe('Venue Service', () => {
    let userStub, venueStub, adStub, cacheGetStub, cacheSetStub;

    beforeEach(() => {
        userStub = sinon.stub(User, 'findById');
        venueStub = sinon.stub(Venue, 'find');
        adStub = sinon.stub(Ad, 'find');
        cacheGetStub = sinon.stub(cacheService, 'getCache');
        cacheSetStub = sinon.stub(cacheService, 'setCache');
    });

    afterEach(async() => {
        sinon.restore();
    });

    afterAll(async () => {
        await cacheService.disconnectRedis();
    });

    it('should return cached venues if available', async () => {
        const userId = 'userId';
        const cachedData = [{ name: 'Cached Venue' }];
        cacheGetStub.resolves(cachedData);

        const result = await venueService.getRankedVenues(userId, 0, 0);

        expect(result).to.deep.equal(cachedData);
        expect(cacheGetStub.calledOnce).to.be.true;
    });

    it('should rank venues and insert ads', async () => {
        const user = { _id: 'userId', zone: 'Chennai North', preferredSports: ['Cricket'] };
        const venues = [
            { _id: '1', location: { coordinates: [12, 12] }, availableSports: ['Cricket'], rating: 5 },
            { _id: '2', location: { coordinates: [15, 15] }, availableSports: ['Football'], rating: 3 }
        ];
        const ads = [
            { zone: 'Chennai North', insertionPosition: 1, content: 'Ad 1' }
        ];
    
        userStub.resolves(user);
        venueStub.resolves(venues);
        adStub.resolves(ads);
        cacheGetStub.resolves(null);
    
        const result = await venueService.getRankedVenues(user._id, 0, 0);
    
        expect(result).to.have.lengthOf(3);
    
        // Verify venue insertion
        expect(result[0]).to.deep.equal({ _id: '1', location: { coordinates: [12, 12] }, availableSports: ['Cricket'], rating: 5 });
        // Verify ad insertion
        expect(result[1]).to.deep.equal({ adContent: 'Ad 1' });
        // Verify venue insertion after ad
        expect(result[2]).to.deep.equal({ _id: '2', location: { coordinates: [15, 15] }, availableSports: ['Football'], rating: 3 });
    
        expect(cacheGetStub.calledOnce).to.be.true;
        expect(cacheSetStub.calledOnce).to.be.true;
    });
});