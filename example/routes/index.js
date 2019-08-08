const express = require('express');
const { Client } = require('@endpass/endpass-node');

const router = express.Router();

const c = new Client({
  clientId: '593f4c87-a819-45e4-9f9a-218f8650de63',
  clientSecret: 'b1a53004-38ad-49f7-875b-1b5629a0a2d9',
  scopes: ['user:email:read'],
  state: '1fae1dbc-2141-4c14-a7da-126123e25154',
  redirectUrl: 'http://localhost:3000/handler',
});

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Oauth test app' });
});
router.get('/auth', (req, res) => {
  res.redirect(c.getAuthUrl());
});
router.get('/handler', async (req, res, next) => {
  const { code } = req.query;

  try {
    const { accessToken } = await c.exchange(code);

    res.render('oauth', { title: 'Oauth app handler', token: accessToken });
  } catch (err) {
    next(err);
  }
});
// router.get('/request', (req, res) => {
//   // res.redirect(c.getAuthUrl())
//   res.render('request', {
//     title: 'Oauth test app request',
//     date: { foo: bar },
//   });
// });

module.exports = router;
