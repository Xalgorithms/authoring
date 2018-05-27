const octokit = require('@octokit/rest')();
const jwt = require('jsonwebtoken');
const fs = require('fs');

const config = require('../config');

function generateJwt (id, cert) {
  const payload = {
    iat: Math.floor(new Date() / 1000),       // Issued at time
    exp: Math.floor(new Date() / 1000) + 60,  // JWT expiration time
    iss: id                                   // Integration's GitHub id
  }

  // Sign with RSA SHA256
  return jwt.sign(payload, cert,  {algorithm: 'RS256' })
}

function init() {
  const token = getToken();

  // For server to server
  octokit.authenticate({
    type: 'app',
    token: token,
  });

  // For user to server
  octokit.authenticate({
    type: 'oauth',
    key: config.OAUTH.KEY,
    secret: config.OAUTH.SECRET,
  });
}

function getToken() {
  return generateJwt(config.APP_ID, process.env.PRIVATE_KEY || fs.readFileSync('private-key.pem'));
}

module.exports = {
  init,
  getToken
};
