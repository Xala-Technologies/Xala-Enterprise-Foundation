import { Logger, LogLevel } from '../index';

describe('Logger Module', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    logger = new Logger({ level: LogLevel.INFO });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      logger.info('Test message', { userId: '123' });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: 'Test message',
          userId: '123',
          timestamp: expect.any(String),
        })
      );
    });

    it('should respect log level', () => {
      const debugLogger = new Logger({ level: LogLevel.ERROR });
      debugLogger.info('This should not log');

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Structured Logging', () => {
    it('should handle complex objects', () => {
      const complexData = {
        user: { id: '123', name: 'Test' },
        action: 'login',
        metadata: { ip: '127.0.0.1' },
      };

      logger.info('User action', complexData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...complexData,
          message: 'User action',
        })
      );
    });
  });

  describe('Error Logging', () => {
    it('should log errors with stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          message: 'Error occurred',
          error: expect.objectContaining({
            message: 'Test error',
            stack: expect.any(String),
          }),
        })
      );
    });
  });
});
