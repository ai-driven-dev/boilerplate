export const Client = jest.fn().mockImplementation(() => ({
  login: jest.fn(),
  once: jest.fn(),
  on: jest.fn(),
  destroy: jest.fn(),
}));

export const REST = jest.fn().mockImplementation(() => ({
  setToken: jest.fn().mockReturnThis(),
  put: jest.fn(),
}));

export const SlashCommandBuilder = jest.fn().mockImplementation(() => ({
  setName: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  addStringOption: jest.fn().mockReturnThis(),
  toJSON: jest.fn().mockReturnValue({}),
}));

export const GatewayIntentBits = {
  Guilds: 1,
  GuildMessages: 512,
};

export const Routes = {
  applicationCommands: jest.fn(),
};