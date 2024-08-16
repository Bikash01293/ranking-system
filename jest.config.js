module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!(chai|other-module-to-transform)/)'],
    transform: {
      "^.+\\.js$": "babel-jest"
    }
};