const express = require('express');
const generatePassword = require('password-generator');
const jwt = require('jsonwebtoken');

const router = express.Router();

const SECRET = process.env.SECRET || 'my-testing-secret';

router.use((req, res, next) => {
  // * obselete (Use Authorization: Bearer)
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  const token = req.cookies && req.cookies.token;
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET, (error, decoded) => {
    if (error) {
      console.error("Not Authorized");
      res.sendStatus(403);
    } else {
      const {user} = decoded;
      req.user = user;
      next();
    }
  });
});

router.get('/userCount', (req, res) => {
  res.json(1234);
});

// router.get('/passwords', (req, res) => {
//   const count = 5;

//   const passwords = Array.from(Array(count).keys()).map((i) =>
//     generatePassword(12, false)
//   );

//   res.json(passwords);

//   console.log(`Sent ${count} passwords`);
// });

module.exports = router;
