const express = require('express');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET || 'my-testing-secret';

const router = express.Router();

router.post('/login', (req, res) => {
  const {user} = req.body;
  var token = jwt.sign({user}, SECRET, {
    expiresIn: '20m',
  });

  res.cookie('token', token, {
    maxAge: 60000*20,
    httpOnly: true,
  });
  res.sendStatus(200)
});

module.exports = router;
