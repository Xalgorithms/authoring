// Copyright 2018 Hayk Pilosyan <hayk.pilos@gmail.com>
// This file is part of Interlibr, a functional component of an
// Internet of Rules (IoR).
// ACKNOWLEDGEMENTS
// Funds: Xalgorithms Foundation
// Collaborators: Don Kelly, Joseph Potvin and Bill Olders.
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License. You may
// obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

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
