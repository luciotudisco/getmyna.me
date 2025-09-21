import pino from 'pino';

/**
 * Create a logger instance with standard JSON output.
 * More info at https://getpino.io/#/docs/api?id=pino-logger
 */
const logger = pino({
    level: 'info',
});

export default logger;
