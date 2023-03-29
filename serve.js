// server.js

const express = require('express');
const path = require('path');

// Create Express Server
const app = express();

// Configuration
const PORT = 4126;
const HOST = '127.0.0.1';
const MOUNT_POINT = '/'; // 指定挂载点

// Serve files from the current directory
app.use(MOUNT_POINT, express.static(path.join(".")));

// Redirect root route to index.html
app.use(MOUNT_POINT, express.static(path.join(__dirname), { index: 'main.html' }));

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
  console.log(`Files are mounted at http://${HOST}:${PORT}${MOUNT_POINT}`);
});
