const express = require('express');
const generatePassword = require('password-generator');

const router = express.Router();

router.get('/passwords', (req, res) => {
  const count = 5;

  // Generate some passwords
  const passwords = Array.from(Array(count).keys()).map((i) =>
    generatePassword(12, false)
  );

  // Return them as json
  res.json(passwords);

  console.log(`Sent ${count} passwords`);
});

module.exports = router;