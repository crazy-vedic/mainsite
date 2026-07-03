require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');

const app = express();
const port = parseInt(process.env.PORT, 10) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/content', require('./backend/routes/content'));
app.use('/api/chat', require('./backend/routes/chat'));

app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const server = http.createServer(app);

server.on('error', (error) => {
  console.error(`Server encountered an error: ${error.message}`);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
