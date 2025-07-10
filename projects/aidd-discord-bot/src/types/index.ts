export interface SaveLinkCommandOptions {
  url: string;
  title?: string;
}

export interface WebScrapingResult {
  title: string;
  description: string;
  url: string;
}

export interface IssueData {
  title: string;
  description: string;
  url: string;
  submittedBy: string;
}

export interface BotConfig {
  discordToken: string;
  discordClientId: string;
  githubToken: string;
  githubOwner: string;
  githubRepo: string;
  ambassadorRoleName: string;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}