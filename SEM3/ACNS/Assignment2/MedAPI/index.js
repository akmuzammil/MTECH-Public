// Main entry point for the Node.js server
// This server will proxy requests to the Python Flask API

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));

// Welcome message
app.get('/', (req, res) => {
  res.send('Medical Image Analysis API Gateway');
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js server running at http://localhost:${port}`);
  console.log(`Python API will be available at http://localhost:5000`);
});

// Log that the user needs to start the Python API separately
console.log('\nIMPORTANT: You need to start the Python API separately.');
console.log('Run the following command in a new terminal:');
console.log('python api/app.py\n');