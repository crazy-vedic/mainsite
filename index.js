const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const dev = process.env.DEVELOPMENT;
const port = dev?3005:80; // Choose the desired port number
console.log(dev);
app.use(cors());
app.use(bodyParser.json());
/*[Wed Aug  2 04:20:01 UTC 2023] Your cert is in: /root/.acme.sh/vedicvarma.com_ecc/vedicvarma.com.cer
[Wed Aug  2 04:20:01 UTC 2023] Your cert key is in: /root/.acme.sh/vedicvarma.com_ecc/vedicvarma.com.key
[Wed Aug  2 04:20:01 UTC 2023] The intermediate CA cert is in: /root/.acme.sh/vedicvarma.com_ecc/ca.cer
[Wed Aug  2 04:20:01 UTC 2023] And the full chain certs is there: /root/.acme.sh/vedicvarma.com_ecc/fullchain.cer*/
if (false) {var options = {
  key: fs.readFileSync('/var/www/certs/vedicvarma.com.key'),
  cert: fs.readFileSync('/var/www/certs/vedicvarma.com.cer'),
};}

//Serving https certificate
app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

// Serve the index.html
app.get('/',(req,res) => {
  res.sendFile(path.join(__dirname,"home","index.html"));
})
app.use('/home', express.static(path.join(__dirname, 'home')));

//Backend files
app.use('/api/students', require('./backend/studentManagement'));
app.use('/api/naithani', require('./project-Naithani/backend'));

//project naithani
app.use(express.static(path.join(__dirname, 'project-Naithani', 'build')));
app.get('/projects/naithani', (req, res) => {
  res.sendFile(path.join(__dirname, 'project-Naithani', 'build', 'index.html'));
});

//Serve student managements files
app.use(express.static(path.join(__dirname, 'studentManagement-frontend', 'build')));
app.get('/projects/studentManagement', (req, res) => {
  res.sendFile(path.join(__dirname, 'studentManagement-frontend', 'build', 'index.html'));
});

//All routes that weren't found
app.get('*', (req, res) => {
  res.send("Hello World");
  console.log(req.url);})

if (true) {var server = http.createServer(app);
} else {var server = https.createServer(options, app);}


server.on('error', (error) => {
  console.error(`Server encountered an error: ${error.message}`);
});
// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
