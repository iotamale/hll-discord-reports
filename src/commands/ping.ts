import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from "../logger";
import { ExtendedClient } from '../types/discordClientTypes';
import { BotClient } from '../botClient';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction: CommandInteraction, botClient: BotClient) {
    logger.useraction('Ping command executed successfully.');
    // console.log(botClient.crconClient.hllServers);
    const url = botClient.crconClient.hllServers[0].apiBaseUrl
    console.log(url);
    const data = await botClient.crconClient.getGameState(botClient.crconClient.hllServers[0].apiBaseUrl)
    console.log(data);
    await interaction.reply('Pong!');
}