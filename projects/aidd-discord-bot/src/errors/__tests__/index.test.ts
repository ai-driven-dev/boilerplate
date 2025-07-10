import { 
  BotError, 
  ValidationError, 
  PermissionError, 
  WebScrapingError, 
  GitHubError, 
  ConfigurationError 
} from '../index';

describe('Error Classes', () => {
  describe('BotError', () => {
    it('should create a BotError with message and code', () => {
      const error = new BotError('Test error', 'TEST_CODE');
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('BotError');
    });

    it('should create a BotError with details', () => {
      const details = { additional: 'info' };
      const error = new BotError('Test error', 'TEST_CODE', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid input');
      
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('PermissionError', () => {
    it('should create a PermissionError with default message', () => {
      const error = new PermissionError();
      
      expect(error.message).toBe('You need the Ambassador role to use this command');
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.name).toBe('PermissionError');
    });

    it('should create a PermissionError with custom message', () => {
      const error = new PermissionError('Custom permission error');
      
      expect(error.message).toBe('Custom permission error');
      expect(error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('WebScrapingError', () => {
    it('should create a WebScrapingError with correct properties', () => {
      const error = new WebScrapingError('Scraping failed');
      
      expect(error.message).toBe('Scraping failed');
      expect(error.code).toBe('WEB_SCRAPING_ERROR');
      expect(error.name).toBe('WebScrapingError');
    });
  });

  describe('GitHubError', () => {
    it('should create a GitHubError with correct properties', () => {
      const error = new GitHubError('GitHub API failed');
      
      expect(error.message).toBe('GitHub API failed');
      expect(error.code).toBe('GITHUB_ERROR');
      expect(error.name).toBe('GitHubError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create a ConfigurationError with correct properties', () => {
      const error = new ConfigurationError('Missing config');
      
      expect(error.message).toBe('Missing config');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
    });
  });
});