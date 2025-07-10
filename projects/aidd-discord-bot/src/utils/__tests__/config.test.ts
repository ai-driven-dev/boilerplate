import { getConfig } from '../config';
import { ConfigurationError } from '../../errors';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Suppress dotenv logs during tests
    process.env.DOTENV_CONFIG_SILENT = 'true';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should return valid configuration when all env vars are set', () => {
      process.env.DISCORD_BOT_TOKEN = 'test-discord-token';
      process.env.DISCORD_CLIENT_ID = 'test-client-id';
      process.env.GITHUB_TOKEN = 'test-github-token';
      process.env.GITHUB_OWNER = 'test-owner';
      process.env.GITHUB_REPO = 'test-repo';
      process.env.AMBASSADOR_ROLE_NAME = 'Ambassador';

      const config = getConfig();

      expect(config).toEqual({
        discordToken: 'test-discord-token',
        discordClientId: 'test-client-id',
        githubToken: 'test-github-token',
        githubOwner: 'test-owner',
        githubRepo: 'test-repo',
        ambassadorRoleName: 'Ambassador'
      });
    });

    it('should throw ConfigurationError when required env vars are missing', () => {
      delete process.env.DISCORD_BOT_TOKEN;
      delete process.env.DISCORD_CLIENT_ID;
      delete process.env.GITHUB_TOKEN;

      expect(() => getConfig()).toThrow(ConfigurationError);
      expect(() => getConfig()).toThrow('Missing required environment variables: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, GITHUB_TOKEN');
    });

    it('should throw ConfigurationError when all env vars are missing', () => {
      process.env = {};

      expect(() => getConfig()).toThrow(ConfigurationError);
      expect(() => getConfig()).toThrow('Missing required environment variables');
    });
  });
});