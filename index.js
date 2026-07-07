require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const port = parseInt(process.env.PORT, 10) || 3001;
const morgan = require('morgan');

app.use(cors());
app.use(express.json());

app.set('trust proxy', 1);
app.use('/api/content', require('./backend/routes/content'));
app.use('/api/chat', require('./backend/routes/chat'));
app.use(morgan('dev'));

const server = http.createServer(app);

server.on('error', (error) => {
  console.error(`Server encountered an error: ${error.message}`);
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
