import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../../logger';
import { ExtendedClient } from '../../types/discordClientTypes';
import { BotClient } from '../../botClient';
import { handleReport } from '../../utils/reports';
import { CRCONClient } from '../../utils/crconApiClient';

export const data = {
	name: 'report-claim',
	preventDoubleClick: true,
};

export async function execute(interaction: CommandInteraction, botClient: BotClient, actionId: string) {
	console.log('Executing report-claim action, actionId:', actionId);
	await interaction.editReply({ content: 'askjhdadsjkjhkdas' });
}
