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
