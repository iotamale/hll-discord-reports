import { GatewayIntentBits, TextChannel } from 'discord.js';
import fs from 'fs';
import logger from './logger';
import path from 'path';
import { ExtendedClient } from './types/discordClientTypes';
import { deployCommands } from './deployCommands';
import { BotClient } from './botClient';
// import { m_1 } from './utils/timeUtils';
import { BaseEmbed } from './types/embedTypes';
const config = require('../config.json');


const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const commandsPath = path.join(__dirname, 'commands');
logger.info(`Commands path: ${commandsPath}`);
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
logger.info(`Command files: ${commandFiles}`);

for (const file of commandFiles) {
    logger.info(`Loading command: ${file}`);
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

let botClient: BotClient;

client.once('ready', async () => {
    logger.info('Bot is online!');

    // Log the servers the bot is connected to
    client.guilds.cache.forEach(guild => {
        logger.info(`Connected to server: ${guild.name}, ${guild.id}`);
    });

    client.guilds.cache.forEach(guild => {
        deployCommands(commandFiles, commandsPath, guild.id);
    });

    botClient = new BotClient(client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        logger.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});
const embed  = new BaseEmbed('info');

client.login(config.discord_token);