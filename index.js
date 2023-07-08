const express = require('express');
const path = require('path');

const app = express();
const port = 80; // Choose the desired port number

// Serve static files from the 'build' folder
app.use(express.static(path.join(__dirname, 'studentManagement-frontend', 'build')));

// Define additional routes or middleware if needed

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'studentManagement-frontend', 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
