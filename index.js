const express = require('express');
const path = require('path');
const backend = require('./studentManagement-backend/index.js');
const mongoose = require('mongoose');
const http = require('http');

const frontendApp = express();
const backendApp = express();

const frontendPort = 80; // Port for serving the frontend build
const backendPort = 3001; // Port for running the backend server

// Serve static files from the 'build' folder
frontendApp.use(express.static(path.join(__dirname, 'studentManagement-frontend', 'build')));

// Serve the index.html file for all frontend routes
frontendApp.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'studentManagement-frontend', 'build', 'index.html'));
});

// Mount the backend middleware
backendApp.use('/api', backend);

// Create the frontend and backend server instances
const frontendServer = http.createServer(frontendApp);
const backendServer = http.createServer(backendApp);

// Start the frontend server
frontendServer.listen(frontendPort, () => {
  console.log(`Frontend server is running on port ${frontendPort}`);
});

// Start the backend server
const mongoURL = 'mongodb+srv://admin:pass@cluster0.tjfctuy.mongodb.net/studentDBMSDB?retryWrites=true&w=majority';
mongoose.connect(mongoURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected to database studentDBMSDB');
  backendServer.listen(backendPort, () => {
    console.log(`Backend server is running on port ${backendPort}`);
  });
});
