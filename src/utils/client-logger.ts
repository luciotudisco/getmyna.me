// Client-side logger for React components
// This logger will use console methods but with structured logging similar to Pino

interface LogLevel {
  level: string;
  time: string;
  msg: string;
  [key: string]: any;
}

class ClientLogger {
  private formatLog(level: string, msg: string, ...args: any[]): LogLevel {
    return {
      level,
      time: new Date().toISOString(),
      msg,
      ...args.reduce((acc, arg, index) => {
        if (typeof arg === 'object' && arg !== null) {
          return { ...acc, ...arg };
        }
        return { ...acc, [`arg${index}`]: arg };
      }, {}),
    };
  }

  info(msg: string, ...args: any[]): void {
    const logEntry = this.formatLog('info', msg, ...args);
    console.log(JSON.stringify(logEntry));
  }

  error(msg: string, ...args: any[]): void {
    const logEntry = this.formatLog('error', msg, ...args);
    console.error(JSON.stringify(logEntry));
  }

  warn(msg: string, ...args: any[]): void {
    const logEntry = this.formatLog('warn', msg, ...args);
    console.warn(JSON.stringify(logEntry));
  }

  debug(msg: string, ...args: any[]): void {
    const logEntry = this.formatLog('debug', msg, ...args);
    console.debug(JSON.stringify(logEntry));
  }
}

export const clientLogger = new ClientLogger();
export default clientLogger;