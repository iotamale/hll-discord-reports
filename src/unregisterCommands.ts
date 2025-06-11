import { REST, Routes } from 'discord.js';
const config = require('../config.json');
import logger from './logger';

const discordToken = config.DISCORD_TOKEN;
if (!discordToken) {
    throw new Error('DISCORD_TOKEN is not defined in the environment variables');
}

const rest = new REST({ version: '10' }).setToken(discordToken);

async function unregisterCommands() {
    try {
        logger.info('Started unregistering application (/) commands.');
        const clientId = config.DISCORD_APP_ID;
        if (!clientId) {
            throw new Error('DISCORD_APP_ID is not defined in the environment variables');
        }

        // Unregister global commands
        const globalCommands = await rest.get(
            Routes.applicationCommands(clientId)
        ) as any[];

        for (const command of globalCommands) {
            await rest.delete(
                Routes.applicationCommand(clientId, command.id)
            );
            logger.info(`Deleted global command: ${command.name}`);
        }

        // Unregister guild commands
        const guildId = process.env.GUILD_ID; // Add your guild ID here for testing
        if (guildId) {
            const guildCommands = await rest.get(
                Routes.applicationGuildCommands(clientId, guildId)
            ) as any[];

            for (const command of guildCommands) {
                await rest.delete(
                    Routes.applicationGuildCommand(clientId, guildId, command.id)
                );
                logger.info(`Deleted guild command: ${command.name}`);
            }
        }

        logger.info('Successfully unregistered all application (/) commands.');
    } catch (error) {
        logger.error(error);
    }
}

unregisterCommands();