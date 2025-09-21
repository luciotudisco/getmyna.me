import pino from 'pino';

// Create a logger instance with standard JSON output
const logger = pino({
    level: 'info',
});

export default logger;
