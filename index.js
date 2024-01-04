require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { url } = require('inspector');
const bodyParser = require('body-parser');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function validateUrl(req, res, next) {
  const url = req.body.url;
  dns.lookup(url, (err, address, family) => {
    if (err) return res.status(400).json({ error: 'Invalid URL' });
    next();
  });
 }

app.use('/api/shorturl/', validateUrl);

let urlDatabase = new Map();

///api/shorturl/
/// 1. An URL can be Postet to /api/shorturl and will be checked if it is valid
/// 2. The URL will be saved in the database
/// 3. The URL will be returned as a short URL with the prefix https://www.boilerplate-project-urlshortener.tecfac.at/api/shorturl/
app.post('/api/shorturl/', (req, res) => {
  let url = req.body.url;
  if (!url.match(/^[a-zA-Z]+:\/\//)) {
    url = 'http://' + url;
  }
  if(!urlDatabase.has(url)) {
    urlDatabase.set(url, urlDatabase.size + 1);
  }
  res.json({ original_url: url, short_url: parseInt(urlDatabase.get(url)) });
})

app.get('/api/shorturl/:url_id', (req, res) => {
  const url_id = req.params.url_id;

  if (url_id > urlDatabase.size) return res.status(404).json({ error: 'Invalid URL' });
  for (let [url, id] of urlDatabase) {
    if (id == url_id) return res.status(301).redirect(url);
  }
  res.status(404).json({ error: 'Invalid URL' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
