import { CommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import logger from '../logger';
import { BotClient } from '../botClient';
import { handleReport } from '../utils/reports';
import { quickEditReply } from '../utils/utils';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

export async function execute(interaction: CommandInteraction, botClient: BotClient) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	await handleReport('Basiicz', '123', '!admin We keep getting TKed by aroslaw on spawn', botClient.crconClient.hllServers[0], botClient);
	// const xd = await botClient.crconClient.getPlayerList(botClient.crconClient.hllServers[0]);
	// console.log(xd);
	console.log('Ping command executed');
	await quickEditReply('Pong!', 'success', interaction);
}
