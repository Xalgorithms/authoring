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

async function init(octokit) {
  const token = getToken();

  octokit.authenticate({
    type: 'app',
    token: token,
  });

  const installationId = await getInstallationId(octokit);
  const {data: {token: access_token}} = await octokit.apps.createInstallationToken({installation_id: installationId});

  octokit.authenticate({
    type: 'token',
    token: access_token,
  });
}

async function getInstallationId(octokit) {
  const {data: installations} = await octokit.apps.getInstallations();
  const installation = installations.find(function (i) {
    return i.app_id === config.APP_ID;
  });

  return installation && installation.id;
}

function getToken() {
  return generateJwt(config.APP_ID, process.env.PRIVATE_KEY || fs.readFileSync('private-key.pem'));
}

module.exports = {
  init,
  getToken
};
