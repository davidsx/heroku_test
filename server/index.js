const express = require('express');
const Bundler = require('parcel-bundler');
const path = require('path');
const api = require('./server/api');

const file = path.join(__dirname, 'client/index.html');
const options = {
  outDir: './client/dist',
  cacheDir: './client/.cache',
};
const bundler = new Bundler(file, options);

const app = express();

app.use('/api', api);
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
} else {
  app.use(bundler.middleware());
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Password generator listening on ${port}`);
});
