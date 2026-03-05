const express = require('express');
const cors = require('cors');

// Import routes
const usersRoutes = require('./routes/users');
const jobsRoutes = require('./routes/jobs');
const messagesRoutes = require('./routes/messages');
const conversationsRoutes = require('./routes/conversations');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON body parsing

// Register routes
app.use('/users', usersRoutes);
app.use('/jobs', jobsRoutes);
app.use('/messages', messagesRoutes);
app.use('/conversations', conversationsRoutes);

// Simple health check route
app.get('/', (req, res) => {
    res.send('Backend API is running. Temporary in-memory storage active.');
});

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = (port) => {
    app.listen(port, () => {
        console.log(`Backend running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer(PORT);
