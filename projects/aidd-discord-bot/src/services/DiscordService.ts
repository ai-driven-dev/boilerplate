import { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder,
  CommandInteraction,
  ChatInputCommandInteraction,
  GuildMember
} from 'discord.js';
import { BotConfig } from '../types';
import { PermissionError, BotError } from '../errors';

export class DiscordService {
  private client: Client;
  private config: BotConfig;
  private rest: REST;

  constructor(config: BotConfig) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });
    this.rest = new REST({ version: '10' }).setToken(config.discordToken);
  }

  public async initialize(): Promise<void> {
    try {
      await this.registerCommands();
      await this.client.login(this.config.discordToken);
      
      this.client.once('ready', () => {
        console.log(`✅ Discord bot is ready! Logged in as ${this.client.user?.tag}`);
      });

      this.setupEventHandlers();
    } catch (error) {
      throw new BotError(
        `Failed to initialize Discord service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'DISCORD_INIT_ERROR',
        error
      );
    }
  }

  private async registerCommands(): Promise<void> {
    const commands = [
      new SlashCommandBuilder()
        .setName('save-link')
        .setDescription('Save a link to the AI-Driven Dev resources repository')
        .addStringOption(option =>
          option.setName('url')
            .setDescription('The URL of the resource to save')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Custom title for the resource (optional)')
            .setRequired(false)
        )
        .toJSON(),
    ];

    try {
      console.log('🔄 Registering slash commands...');
      await this.rest.put(
        Routes.applicationCommands(this.config.discordClientId),
        { body: commands }
      );
      console.log('✅ Slash commands registered successfully!');
    } catch (error) {
      throw new BotError(
        `Failed to register slash commands: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMMAND_REGISTRATION_ERROR',
        error
      );
    }
  }

  private setupEventHandlers(): void {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'save-link') {
        await this.handleSaveLinkCommand(interaction);
      }
    });

    this.client.on('error', (error) => {
      console.error('❌ Discord client error:', error);
    });
  }

  private async handleSaveLinkCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      if (!this.hasAmbassadorRole(interaction.member as GuildMember)) {
        throw new PermissionError();
      }

      const url = interaction.options.getString('url', true);
      const title = interaction.options.getString('title', false);

      // This will be implemented in the main bot class
      await this.processSaveLinkCommand(url, title, interaction);
    } catch (error) {
      await this.handleCommandError(interaction, error);
    }
  }

  private hasAmbassadorRole(member: GuildMember): boolean {
    return member.roles.cache.some(role => role.name === this.config.ambassadorRoleName);
  }

  private async processSaveLinkCommand(
    _url: string, 
    _title: string | null, 
    _interaction: ChatInputCommandInteraction
  ): Promise<void> {
    // This method will be called by the main bot class
    // It's a placeholder for now
    throw new Error('Method not implemented - will be handled by main bot class');
  }

  private async handleCommandError(interaction: CommandInteraction, error: any): Promise<void> {
    let errorMessage = '❌ An unexpected error occurred.';

    if (error instanceof PermissionError) {
      errorMessage = `❌ ${error.message}`;
    } else if (error instanceof BotError) {
      errorMessage = `❌ ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = `❌ ${error.message}`;
    }

    try {
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      console.error('❌ Failed to send error message:', replyError);
    }
  }

  public getClient(): Client {
    return this.client;
  }

  public async setCommandHandler(handler: (url: string, title: string | null, interaction: ChatInputCommandInteraction) => Promise<void>): Promise<void> {
    this.processSaveLinkCommand = handler;
  }
}