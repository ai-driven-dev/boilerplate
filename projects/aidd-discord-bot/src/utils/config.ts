import { config } from 'dotenv';
import { BotConfig } from '../types';
import { ConfigurationError } from '../errors';

config();

export function getConfig(): BotConfig {
  const requiredEnvVars = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_CLIENT_ID',
    'GITHUB_TOKEN',
    'GITHUB_OWNER',
    'GITHUB_REPO',
    'AMBASSADOR_ROLE_NAME'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new ConfigurationError(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    discordToken: process.env.DISCORD_BOT_TOKEN!,
    discordClientId: process.env.DISCORD_CLIENT_ID!,
    githubToken: process.env.GITHUB_TOKEN!,
    githubOwner: process.env.GITHUB_OWNER!,
    githubRepo: process.env.GITHUB_REPO!,
    ambassadorRoleName: process.env.AMBASSADOR_ROLE_NAME!
  };
}