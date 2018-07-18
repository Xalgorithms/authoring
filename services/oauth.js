const crypto = require('crypto');
const request = require('request');
const url = require('url');

module.exports = function(opts) {
  const state = crypto.randomBytes(8).toString('hex');

  function login(req, resp) {
    const {client_id, scope = '', redirect_uri} = opts;

    const u = `https://github.com/login/oauth/authorize` +
      `?client_id=${client_id}` +
      `&scope=${scope}` +
      `&redirect_uri=${redirect_uri}` +
      `&state=${state}`;

    resp.statusCode = 302;
    resp.setHeader('location', u);
    resp.end();
  }

  function callback(req, resp) {
    const {client_id, client_secret} = opts;
    const query = url.parse(req.url, true).query;
    const code = query.code;

    var u = `https://github.com/login/oauth/access_token` +
       `?client_id=${client_id}` +
       `&client_secret=${client_secret}` +
       `&code=${code}` +
       `&state=${state}`;

    return new Promise(function(resolve, reject){
      if (!code) {
        return reject('no oauth code');
      }

      request.get({url: u, json: true}, (err, tokenResp, body) => {
        if (err) {
          err.body = body;
          err.tokenResp = tokenResp;

          return reject(err);
        }

        resolve(body);
      })
    });
  }

  return {
    login,
    callback,
  };
};