const express = require('express');
const generatePassword = require('password-generator');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET = process.env.SECRET || 'my-testing-secret';

router.use((req, res, next) => {
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  // if (token == null) return res.sendStatus(401);
  const token = res.cookies && res.cookies.token;

  jwt.verify(token, SECRET, (error, decoded) => {
    if (error) return res.sendStatus(403);
    const {user} = decoded;
    req.user = user;
    next();
  });
});

router.get('/passwords', (req, res) => {
  const count = 5;

  const passwords = Array.from(Array(count).keys()).map((i) =>
    generatePassword(12, false)
  );

  res.json(passwords);

  console.log(`Sent ${count} passwords`);
});

router.get('/userCount', (req, res) => {
  // res.cookie('test', 1234, {
  //   maxAge: 946080000000,
  //   httpOnly: true,
  // });
  console.log(req.cookies);
  res.json(1234);
});

module.exports = router;
