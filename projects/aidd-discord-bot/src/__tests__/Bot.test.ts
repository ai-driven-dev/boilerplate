import { Bot } from '../Bot';
import { DiscordService } from '../services/DiscordService';
import { GitHubService } from '../services/GitHubService';
import { WebScraperService } from '../services/WebScraperService';
import { getConfig } from '../utils/config';
import { WebScrapingError, GitHubError } from '../errors';

jest.mock('../services/DiscordService');
jest.mock('../services/GitHubService');
jest.mock('../services/WebScraperService');
jest.mock('../utils/config');

describe('Bot', () => {
  let bot: Bot;
  let mockDiscordService: jest.Mocked<DiscordService>;
  let mockGitHubService: jest.Mocked<GitHubService>;
  let mockConfig: any;

  beforeEach(() => {
    mockConfig = {
      discordToken: 'test-token',
      discordClientId: 'test-client-id',
      githubToken: 'test-github-token',
      githubOwner: 'test-owner',
      githubRepo: 'test-repo',
      ambassadorRoleName: 'Ambassador'
    };

    (getConfig as jest.Mock).mockReturnValue(mockConfig);

    mockDiscordService = {
      initialize: jest.fn(),
      setCommandHandler: jest.fn(),
      getClient: jest.fn().mockReturnValue({ destroy: jest.fn() }),
    } as any;

    mockGitHubService = {
      createIssue: jest.fn(),
    } as any;

    (DiscordService as jest.MockedClass<typeof DiscordService>).mockImplementation(() => mockDiscordService);
    (GitHubService as jest.MockedClass<typeof GitHubService>).mockImplementation(() => mockGitHubService);

    bot = new Bot();
  });

  describe('start', () => {
    it('should initialize Discord service and set command handler', async () => {
      await bot.start();

      expect(mockDiscordService.initialize).toHaveBeenCalled();
      expect(mockDiscordService.setCommandHandler).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle initialization errors', async () => {
      mockDiscordService.initialize.mockRejectedValue(new Error('Init failed'));

      await expect(bot.start()).rejects.toThrow('Init failed');
    });
  });

  describe('handleSaveLinkCommand', () => {
    let mockInteraction: any;

    beforeEach(() => {
      mockInteraction = {
        editReply: jest.fn(),
        user: { username: 'testuser' }
      };
    });

    it('should process save-link command successfully', async () => {
      const mockScrapingResult = {
        success: true,
        data: {
          title: 'Test Article',
          description: 'Test description',
          url: 'https://example.com'
        }
      };

      const mockIssueResult = {
        success: true,
        data: 'https://github.com/test-owner/test-repo/issues/1'
      };


      (WebScraperService.scrapeWebPage as jest.Mock).mockResolvedValue(mockScrapingResult);
      mockGitHubService.createIssue.mockResolvedValue(mockIssueResult);

      await bot.start();
      const commandHandler = (mockDiscordService.setCommandHandler as jest.Mock).mock.calls[0][0];
      
      await commandHandler('https://example.com', null, mockInteraction);

      expect(WebScraperService.scrapeWebPage).toHaveBeenCalledWith('https://example.com');
      expect(mockGitHubService.createIssue).toHaveBeenCalledWith({
        title: 'Test Article',
        description: 'Test description',
        url: 'https://example.com',
        submittedBy: 'testuser'
      });
      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: '✅ Resource saved successfully! GitHub Issue created: https://github.com/test-owner/test-repo/issues/1'
      });
    });

    it('should use custom title when provided', async () => {
      const mockScrapingResult = {
        success: true,
        data: {
          title: 'Original Title',
          description: 'Test description',
          url: 'https://example.com'
        }
      };

      const mockIssueResult = {
        success: true,
        data: 'https://github.com/test-owner/test-repo/issues/1'
      };


      (WebScraperService.scrapeWebPage as jest.Mock).mockResolvedValue(mockScrapingResult);
      mockGitHubService.createIssue.mockResolvedValue(mockIssueResult);

      await bot.start();
      const commandHandler = (mockDiscordService.setCommandHandler as jest.Mock).mock.calls[0][0];
      
      await commandHandler('https://example.com', 'Custom Title', mockInteraction);

      expect(mockGitHubService.createIssue).toHaveBeenCalledWith({
        title: 'Custom Title',
        description: 'Test description',
        url: 'https://example.com',
        submittedBy: 'testuser'
      });
    });

    it('should handle web scraping errors', async () => {
      (WebScraperService.scrapeWebPage as jest.Mock).mockRejectedValue(new WebScrapingError('Scraping failed'));

      await bot.start();
      const commandHandler = (mockDiscordService.setCommandHandler as jest.Mock).mock.calls[0][0];
      
      await commandHandler('https://example.com', null, mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: '❌ Failed to fetch content from the provided URL: Scraping failed'
      });
    });

    it('should handle GitHub errors', async () => {
      const mockScrapingResult = {
        success: true,
        data: {
          title: 'Test Article',
          description: 'Test description',
          url: 'https://example.com'
        }
      };


      (WebScraperService.scrapeWebPage as jest.Mock).mockResolvedValue(mockScrapingResult);
      mockGitHubService.createIssue.mockRejectedValue(new GitHubError('Issue creation failed'));

      await bot.start();
      const commandHandler = (mockDiscordService.setCommandHandler as jest.Mock).mock.calls[0][0];
      
      await commandHandler('https://example.com', null, mockInteraction);

      expect(mockInteraction.editReply).toHaveBeenCalledWith({
        content: '❌ Failed to create GitHub issue: Issue creation failed'
      });
    });
  });

  describe('shutdown', () => {
    it('should destroy Discord client', async () => {
      const mockClient = { destroy: jest.fn() };
      mockDiscordService.getClient.mockReturnValue(mockClient as any);

      await bot.shutdown();

      expect(mockClient.destroy).toHaveBeenCalled();
    });
  });
});