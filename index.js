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

const createHandler = require('github-webhook-handler');
const express = require('express');
const cors = require('cors');

const auth = require('./services/auth');
const { getPackages } = require('./services/packages');

const app = express();

const handler = createHandler({
  path: '/',
  secret: process.env.WEBHOOK_SECRET || 'random',
});

auth.init();

app.use(handler);
app.use(cors())

app.get('/package', function (req, res) {
  getPackages().then((packages) => {
    res.json(Object.values(packages));
  });
})

app.listen(process.env.PORT || 7777, () => console.log('Example app listening on port 7777!'));
