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
const bodyParser = require('body-parser');

const { getPackages } = require('./services/packages');
const { storeState, fetchState } = require('./services/firestore');

const app = express();

const handler = createHandler({
  path: '/',
  secret: process.env.WEBHOOK_SECRET || 'random',
});

app.use(handler);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/package', function (req, res) {
  getPackages().then((packages) => {
    res.json(Object.values(packages));
  });
});

app.get('/state/:name', function (req, res) {
  const name = req.params.name;

  fetchState(name).then(doc => {
    if (!doc.exists) {
      res.status(404).json({});
    } else {
      res.send(doc.data());
    }
  })
  .catch(err => {
    console.log('ERR', err);
  });
});

app.post('/state', function (req, res) {
  const { id, payload } = req.body;

  storeState(id, payload).then((data) => {
    res.json(data);
  }).catch((err) => {
    console.log("ERR", err)
  });
});

app.listen(process.env.PORT || 7777, () => console.log('Example app listening on port 7777!'));
