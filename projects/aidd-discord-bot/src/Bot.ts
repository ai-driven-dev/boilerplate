import { ChatInputCommandInteraction } from 'discord.js';
import { DiscordService } from './services/DiscordService';
import { GitHubService } from './services/GitHubService';
import { WebScraperService } from './services/WebScraperService';
import { getConfig } from './utils/config';
import { BotConfig } from './types';
import { BotError, PermissionError, ValidationError, WebScrapingError, GitHubError } from './errors';

export class Bot {
  private discordService: DiscordService;
  private githubService: GitHubService;
  private config: BotConfig;

  constructor() {
    this.config = getConfig();
    this.discordService = new DiscordService(this.config);
    this.githubService = new GitHubService(
      this.config.githubToken,
      this.config.githubOwner,
      this.config.githubRepo
    );
  }

  public async start(): Promise<void> {
    try {
      console.log('🚀 Starting AI-Driven Dev Discord Bot...');
      
      await this.discordService.initialize();
      await this.discordService.setCommandHandler(this.handleSaveLinkCommand.bind(this));
      
      console.log('✅ Bot is running and ready to receive commands!');
    } catch (error) {
      console.error('❌ Failed to start bot:', error);
      throw error;
    }
  }

  private async handleSaveLinkCommand(
    url: string,
    title: string | null,
    interaction: ChatInputCommandInteraction
  ): Promise<void> {
    try {
      console.log(`📝 Processing save-link command for URL: ${url}`);
      
      // Step 1: Scrape the webpage
      const scrapingResult = await WebScraperService.scrapeWebPage(url);
      
      if (!scrapingResult.success || !scrapingResult.data) {
        throw new WebScrapingError('Failed to scrape webpage content');
      }

      // Step 2: Prepare issue data
      const issueData = {
        title: title || scrapingResult.data.title,
        description: scrapingResult.data.description,
        url: scrapingResult.data.url,
        submittedBy: interaction.user.username
      };

      // Step 3: Create GitHub issue
      const issueResult = await this.githubService.createIssue(issueData);
      
      if (!issueResult.success || !issueResult.data) {
        throw new GitHubError('Failed to create GitHub issue');
      }

      // Step 4: Send success response
      const successMessage = `✅ Resource saved successfully! GitHub Issue created: ${issueResult.data}`;
      await interaction.editReply({ content: successMessage });
      
      console.log(`✅ Successfully processed save-link command. Issue: ${issueResult.data}`);
    } catch (error) {
      console.error('❌ Error processing save-link command:', error);
      await this.handleError(interaction, error);
    }
  }

  private async handleError(interaction: ChatInputCommandInteraction, error: any): Promise<void> {
    let errorMessage = '❌ An unexpected error occurred while processing your request.';

    if (error instanceof PermissionError) {
      errorMessage = `❌ ${error.message}`;
    } else if (error instanceof ValidationError) {
      errorMessage = `❌ Invalid input: ${error.message}`;
    } else if (error instanceof WebScrapingError) {
      errorMessage = `❌ Failed to fetch content from the provided URL: ${error.message}`;
    } else if (error instanceof GitHubError) {
      errorMessage = `❌ Failed to create GitHub issue: ${error.message}`;
    } else if (error instanceof BotError) {
      errorMessage = `❌ ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = `❌ ${error.message}`;
    }

    try {
      await interaction.editReply({ content: errorMessage });
    } catch (replyError) {
      console.error('❌ Failed to send error message:', replyError);
    }
  }

  public async shutdown(): Promise<void> {
    console.log('🛑 Shutting down bot...');
    try {
      this.discordService.getClient().destroy();
      console.log('✅ Bot shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}