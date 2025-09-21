import pino from 'pino';

// Create a logger instance with default Pino settings
const logger = pino({
    level: 'info',
});

export default logger;
