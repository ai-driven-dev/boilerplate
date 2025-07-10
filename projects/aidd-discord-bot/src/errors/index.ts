export class BotError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BotError';
  }
}

export class ValidationError extends BotError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class PermissionError extends BotError {
  constructor(message: string = 'You need the Ambassador role to use this command') {
    super(message, 'PERMISSION_DENIED');
    this.name = 'PermissionError';
  }
}

export class WebScrapingError extends BotError {
  constructor(message: string, details?: any) {
    super(message, 'WEB_SCRAPING_ERROR', details);
    this.name = 'WebScrapingError';
  }
}

export class GitHubError extends BotError {
  constructor(message: string, details?: any) {
    super(message, 'GITHUB_ERROR', details);
    this.name = 'GitHubError';
  }
}

export class ConfigurationError extends BotError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}