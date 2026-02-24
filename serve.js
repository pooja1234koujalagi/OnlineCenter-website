// Simple static server for serving the serverless app
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Serve JS files
app.use('/js', express.static(path.join(__dirname, 'js')));

// Default route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Serverless app running on http://localhost:${PORT}`);
    console.log('📁 Serving static files from frontend directory');
    console.log(`🔗 Open http://localhost:${PORT} to access your app`);
});
