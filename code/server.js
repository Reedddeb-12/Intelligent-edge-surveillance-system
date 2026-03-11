// Main Entry Point for IoT Drone Defense System
const { app, io } = require('./backend/src/server');
const logger = require('./backend/src/config/logger');

// The backend server logic is contained in backend/src/server.js
// This file acts as a shortcut for the root package.json

const PORT = process.env.PORT || 5000;

// Note: In development, you might want to run separate servers
// but for a unified start, we use the backend server.

logger.info('System root entry point initialized');

// The actual server is started inside backend/src/server.js
// if (process.env.VERCEL !== '1') { ... } 
// Since we are requiring it, we can either exported start it or 
// rely on the auto-start in that file if it's not being required.
// Actually, backend/src/server.js has 'if (process.env.VERCEL !== "1") { server.listen(...) }'
// but it's not starting because we're in the same process unless we don't 'require' it?
// No, it WILL start if process.env.VERCEL is not 1.
