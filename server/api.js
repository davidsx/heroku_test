const express = require('express');
const generatePassword = require('password-generator');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET = process.env.SECRET || 'my-testing-secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET, (error, decoded) => {
    if (error) return res.sendStatus(403);
    const {user} = decoded;
    req.user = user;
    next();
  })
}

router.use(authenticateToken);

router.get('/passwords', (req, res) => {
  const count = 5;

  const passwords = Array.from(Array(count).keys()).map((i) =>
    generatePassword(12, false)
  );

  res.json(passwords);

  console.log(`Sent ${count} passwords`);
});

module.exports = router;