# AI-Driven Dev Discord Bot

A Discord bot that enables community members with the "Ambassador" role to save resources to the AI-Driven Dev repository using the `/save-link` command.

## Features

- **🔗 Save Links**: Use `/save-link` command to save resources directly from Discord
- **🔒 Role-based Access**: Only users with "Ambassador" role can use the command
- **🌐 Web Scraping**: Automatically extracts title and description from web pages
- **📝 GitHub Integration**: Creates pull requests automatically in the resources repository
- **🐳 Docker Support**: Containerized deployment ready

## Architecture

The bot follows a modular service-oriented architecture:

```
src/
├── services/
│   ├── DiscordService.ts      # Discord bot initialization and command handling
│   ├── GitHubService.ts       # GitHub API integration and PR creation
│   └── WebScraperService.ts   # Web scraping functionality
├── types/
│   └── index.ts              # TypeScript type definitions
├── errors/
│   └── index.ts              # Custom error classes
├── utils/
│   └── config.ts             # Configuration management
├── Bot.ts                    # Main bot orchestration class
└── index.ts                  # Application entry point
```

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd aidd-discord-bot
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Build the application**:

   ```bash
   npm run build
   ```

## Configuration

Create a `.env` file with the following variables:

```env
# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=ai-driven-dev
GITHUB_REPO=ressources

# Bot Configuration
AMBASSADOR_ROLE_NAME=Ambassador
NODE_ENV=production
```

### Discord Setup

1. Create a Discord application at <https://discord.com/developers/applications>
2. Create a bot user and copy the token
3. Copy the application ID (Client ID)
4. Invite the bot to your server with the following permissions:
   - `applications.commands` (for slash commands)
   - `bot` (basic bot permissions)

### GitHub Setup

1. **Create a Personal Access Token** at <https://github.com/settings/tokens>

2. **For Classic Tokens, grant these permissions**:

   - ✅ `repo` (full repository access)
   - ✅ `workflow` (update GitHub Action workflows if needed)

3. . **Verify Repository Access**:
   - Ensure the token has access to `ai-driven-dev/ressources`
   - Check that you can view/fork the repository
   - Organization settings might restrict token access

## Usage

### Running the Bot

**Development mode**:

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

### Discord Commands

**`/save-link`**

- **Description**: Save a link to the AI-Driven Dev resources repository
- **Parameters**:
  - `url` (required): The URL of the resource to save
  - `title` (optional): Custom title for the resource
- **Permissions**: Requires "Ambassador" role

**Example usage**:

```
/save-link url:https://example.com/article title:Great Article About AI
```

## Docker Deployment

**Build the Docker image**:

```bash
docker build -t aidd-discord-bot .
```

**Run the container**:

```bash
docker run -d --name aidd-bot --env-file .env aidd-discord-bot
```

**Docker Compose** (recommended):

```yaml
version: "3.8"
services:
  aidd-discord-bot:
    build: .
    environment:
      - DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - GITHUB_OWNER=${GITHUB_OWNER}
      - GITHUB_REPO=${GITHUB_REPO}
      - AMBASSADOR_ROLE_NAME=${AMBASSADOR_ROLE_NAME}
      - NODE_ENV=production
    restart: unless-stopped
```

## Testing

### Unit & Integration Tests

**Run tests**:

```bash
npm test
```

**Run tests in watch mode**:

```bash
npm run test:watch
```

**Test coverage**:

```bash
npm test -- --coverage
```

### Testing the Bot in Discord

#### Prerequisites

1. **Create a Discord Application**:

   - Go to <https://discord.com/developers/applications>
   - Click "New Application" and give it a name
   - Go to the "Bot" section and click "Add Bot"
   - Copy the bot token for later use

2. **Set Bot Permissions**:

   - In the "OAuth2" > "URL Generator" section
   - Select "bot" and "applications.commands" scopes
   - Select "Send Messages" and "Use Slash Commands" permissions
   - Use the generated URL to invite the bot to your test server

3. **Create GitHub Personal Access Token**:

   - Go to <https://github.com/settings/tokens>
   - Generate a new token with `repo` permissions
   - Copy the token for later use

4. **Set Up Discord Server**:
   - Create a test Discord server or use an existing one
   - Create an "Ambassador" role and assign it to test users
   - Invite the bot using the OAuth2 URL

#### Local Development Testing

**1. Environment Setup**:

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_OWNER=ai-driven-dev
GITHUB_REPO=ressources
AMBASSADOR_ROLE_NAME=Ambassador
NODE_ENV=development
```

**2. Install Dependencies**:

```bash
npm install
```

**3. Build and Run**:

```bash
# Build the project
npm run build

# Start the bot
npm start

# Or for development with auto-reload
npm run dev
```

**4. Test the Bot**:

- In your Discord server, use: `/save-link url:https://example.com/article title:Test Article`
- Check that the bot responds with success/error messages
- Verify pull requests are created in the target GitHub repository

#### Docker Testing

**1. Build Docker Image**:

```bash
# Build the image
docker build -t aidd-discord-bot .
```

**2. Run with Environment File**:

```bash
# Create production .env file
cp .env.example .env.prod
# Edit .env.prod with production values

# Run container
docker run -d \
  --name aidd-bot \
  --env-file .env.prod \
  --restart unless-stopped \
  aidd-discord-bot
```

**3. Monitor Logs**:

```bash
# View logs
docker logs aidd-bot

# Follow logs in real-time
docker logs -f aidd-bot
```

**4. Test Commands**:

- Use the same Discord commands as in local testing
- Monitor logs for any issues: `docker logs -f aidd-bot`

#### Docker Compose (Recommended)

**1. Set up environment variables**:

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Replace the placeholder values with your real tokens
nano .env  # or use your preferred editor
```

**2. Create docker-compose.yml**:

```yaml
version: "3.8"
services:
  aidd-discord-bot:
    build: .
    container_name: aidd-bot
    environment:
      - DISCORD_BOT_TOKEN=${DISCORD_BOT_TOKEN}
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - GITHUB_OWNER=${GITHUB_OWNER}
      - GITHUB_REPO=${GITHUB_REPO}
      - AMBASSADOR_ROLE_NAME=${AMBASSADOR_ROLE_NAME}
      - NODE_ENV=production
    restart: unless-stopped
    # Optional: Add health check
    healthcheck:
      test: ["CMD", "node", "-e", "console.log('Health check passed')"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**3. Run with Docker Compose**:

```bash
# Build and start the bot
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the bot
docker-compose down
```

**⚠️ Important**: Before running, you MUST replace the placeholder values in `.env` with your actual Discord bot token, GitHub token, etc. The container will fail to start with placeholder values.

#### Testing Scenarios

**1. Basic Functionality**:

```bash
# Test valid URL
/save-link url:https://github.com/features/actions title:GitHub Actions

# Test URL without custom title
/save-link url:https://nodejs.org
```

**2. Permission Testing**:

- Test with user having "Ambassador" role (should work)
- Test with user without "Ambassador" role (should get permission error)

**3. Error Scenarios**:

```bash
# Test invalid URL
/save-link url:not-a-valid-url

# Test non-HTTP URL
/save-link url:ftp://example.com/file

# Test unreachable URL
/save-link url:https://this-domain-does-not-exist-12345.com
```

**4. Expected Responses**:

**Success**:

```
✅ Resource saved successfully! Pull request created: https://github.com/ai-driven-dev/ressources/pull/123
```

**Permission Error**:

```
❌ You need the Ambassador role to use this command
```

**Invalid URL**:

```
❌ Failed to fetch content from the provided URL: Invalid URL format
```

**Network Error**:

```
❌ Failed to fetch content from the provided URL: [error details]
```

#### Troubleshooting

**Bot doesn't respond to commands**:

- Check bot permissions in Discord server
- Verify bot token is correct in environment variables
- Check bot logs for authentication errors

**Permission errors for all users**:

- Verify "Ambassador" role exists in your Discord server
- Check that test users have the Ambassador role assigned
- Confirm `AMBASSADOR_ROLE_NAME` matches exactly in .env

**GitHub errors**:

- **"Resource not accessible by personal access token"**:
  - Token lacks required permissions (see GitHub Setup section)
  - Repository doesn't exist or isn't accessible
  - Organization restrictions on token access
- **General GitHub API errors**:
  - Verify token has `repo` or fine-grained `Contents: Write` permissions
  - Check that target repository exists: `https://github.com/ai-driven-dev/ressources`
  - Ensure you have write access to the repository
  - Test token access: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/ai-driven-dev/ressources`

**Docker issues**:

- Check environment variables are properly set
- Verify Docker has internet access for API calls
- Review Docker logs for specific error messages

#### Log Analysis

**Successful operation logs**:

```
🚀 Starting AI-Driven Dev Discord Bot...
✅ Bot is running and ready to receive commands!
📝 Processing save-link command for URL: https://example.com
✅ Successfully processed save-link command. PR: https://github.com/...
```

**Error logs to watch for**:

- Authentication failures
- Network connectivity issues
- GitHub API rate limiting
- Invalid environment configuration

## Error Handling

The bot includes comprehensive error handling:

- **ValidationError**: Invalid URL format
- **PermissionError**: User lacks Ambassador role
- **WebScrapingError**: Failed to fetch or parse webpage
- **GitHubError**: GitHub API or PR creation failures
- **ConfigurationError**: Missing environment variables

All errors are logged and appropriate user-friendly messages are sent to Discord.

## Development

### Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run in development mode with auto-reload
- `npm start` - Run the built application
- `npm test` - Run tests
- `npm run clean` - Clean build directory

### Code Style

The project follows TypeScript best practices:

- Strict type checking enabled
- Comprehensive error handling
- Service-oriented architecture
- Dependency injection pattern

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the bot has proper permissions in Discord
4. Verify GitHub token has necessary permissions

## License

MIT License - see LICENSE file for details.

---

**AI-Driven Dev Discord Bot** - Streamlining resource sharing for the AI-Driven Dev community.
