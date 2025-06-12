import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../logger';
import { ExtendedClient } from '../types/discordClientTypes';
import { BotClient } from '../botClient';
import { handleReport } from '../utils/reports';
import { CRCONClient } from '../utils/crconApiClient';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder().setName('buttons').setDescription('Dev command.');

export async function execute(interaction: CommandInteraction, botClient: BotClient) {
	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder().setCustomId(`report-claim:${123}`).setLabel(`Claim`).setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId(`report-done:${123}`).setLabel(`Done`).setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(`report-trash:${123}`).setLabel(`Unjustified report`).setStyle(ButtonStyle.Danger)
	);

	await interaction.reply({
		content: 'This is a test message with buttons.',
		components: [row],
		ephemeral: true,
	});
}
