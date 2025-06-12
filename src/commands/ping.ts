import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { ExtendedClient } from '../types/discordClientTypes';
import { BotClient } from '../botClient';
import { handleReport } from '../utils/reports';
import { CRCONClient } from '../utils/crconApiClient';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

export async function execute(interaction: CommandInteraction, botClient: BotClient) {
	await handleReport('phx.Dani', '123', '!admin We keep getting TKed by aroslaw on spawn', botClient.crconClient.hllServers[0], botClient);
	// const xd = await botClient.crconClient.getPlayerList(botClient.crconClient.hllServers[0]);
	// console.log(xd);
	await interaction.reply('Pong!');
}
