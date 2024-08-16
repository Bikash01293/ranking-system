const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

// Ensure Redis client connects before performing operations
async function connectRedis() {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        throw err; // Rethrow the error to handle it in calling code
    }
}

// Call connectRedis to ensure Redis is connected before any operations
connectRedis().catch(err => console.error('Redis connection failed:', err));

function getCache(key) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await client.get(key);
            resolve(data ? JSON.parse(data) : null);
        } catch (err) {
            reject(err);
        }
    });
}

function setCache(key, data) {
    return new Promise(async (resolve, reject) => {
        try {
            await client.set(key, JSON.stringify(data), 'EX', 3600);
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
}

async function disconnectRedis() {
    try {
        await client.quit();
        console.log('Disconnected from Redis');
    } catch (err) {
        console.error('Error disconnecting Redis:', err);
    }
}

module.exports = {
    getCache,
    setCache,
    disconnectRedis
};