import { REST, Routes } from 'discord.js';
import { getConfigVariable } from './utils/utils';
import logger from './logger';
import path from 'path';

const discordToken = getConfigVariable('DISCORD_TOKEN');
if (!discordToken) {
    throw new Error('DISCORD_TOKEN is not defined in the environment variables');
}

const rest = new REST({ version: '10' }).setToken(discordToken);

export async function deployCommands(commandFiles: string[], commandsPath: string, guildId: string) {
    const commands = [];

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        logger.info(`Adding command: ${command.data.name}`);
        commands.push(command.data.toJSON());
    }

    try {
        logger.info('Started refreshing application (/) commands.');
        const clientId = getConfigVariable('DISCORD_APP_ID');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), // Register commands for a specific guild
            { body: commands },
        );

        logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
        logger.error(error);
    }
}