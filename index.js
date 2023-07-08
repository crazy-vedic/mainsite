const express = require('express');
const path = require('path');
const backend = require('./studentManagement-backend/index.js');
const mongoose = require('mongoose');
const http = require('http');

const app = express();
const frontendPort = 80; // Port for serving the frontend build
const backendPort = 3001; // Port for running the backend server

// Serve static files from the 'build' folder
app.use(express.static(path.join(__dirname, 'studentManagement-frontend', 'build')));

// Mount the backend middleware
app.use('/api', backend);

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'studentManagement-frontend', 'build', 'index.html'));
});

// Create the HTTP server instance
const server = http.createServer(app);

// Start the server for serving the frontend build and running the backend server
const mongoURL = 'mongodb+srv://admin:pass@cluster0.tjfctuy.mongodb.net/studentDBMSDB?retryWrites=true&w=majority';
mongoose.connect(mongoURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected to database studentDBMSDB');
  server.listen(frontendPort, () => {
    console.log(`Server is running on port ${frontendPort}`);
    backend.listen(backendPort, () => {
      console.log(`Backend server is running on port ${backendPort}`);
    });
  });
});
