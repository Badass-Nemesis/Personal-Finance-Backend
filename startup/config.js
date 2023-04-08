const config = require('config');

module.exports = function () {
    if (!process.env.JWT_PRIVATE_KEY) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined');
    }
}