const express = require('express');
const Bundler = require('parcel-bundler');
const path = require('path');
const api = require('./api');

const app = express();

const port = process.env.PORT || 5000;
const env = process.env.NODE_ENV || 'development';

app.use('/api', api);

if (env !== 'production') {
  const file = path.join(__dirname, '../client/index.html');
  const options = {
    outDir: './client/dist',
    cacheDir: './client/.cache',
  };
  const bundler = new Bundler(file, options);
  app.use(bundler.middleware());
} else {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}


app.listen(port, () => {
  console.log(`Password generator listening on ${port}`);
});
