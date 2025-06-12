import { CommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import logger from '../../logger';
import { BotClient } from '../../botClient';
import { BaseEmbed } from '../../types/messageTypes';
import { getConfigVariable } from '../../utils/utils';
import { quickEditReply } from '../../utils/utils';

export const data = {
	name: 'report-claim',
	preventDoubleClick: true,
};

export async function execute(interaction: CommandInteraction, botClient: BotClient, actionId: string) {
	if (!interaction.channel || !interaction.guild) return logger.error('Interaction channel/guild not found');

	const triggerMsg = await interaction.channel.messages.fetch(actionId);
	const embedData = triggerMsg?.embeds[0]?.data;
	const guildMember = await interaction.guild.members.fetch(interaction.user.id);
	const colors = getConfigVariable('colors');

	if (!embedData) {
		return await interaction.editReply({ content: 'No embed data found in the message.' });
	}

	const row = new ActionRowBuilder().addComponents([
		new ButtonBuilder().setCustomId(`report-done:${actionId}`).setLabel(`Done`).setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(`report-trash:${actionId}`).setLabel(`Unjustified report`).setStyle(ButtonStyle.Danger),
	]);

	const fields = [
		...(embedData.fields ?? []),
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Assigned admin', value: `${interaction.user.toString()} ${guildMember.nickname || interaction.user.displayName}` },
	];

	const serverNameMatch = embedData.title?.match(/\(([^)]+)\)/);
	const serverName = serverNameMatch ? serverNameMatch[1] : '';
	const embed = new BaseEmbed('info')
		.setDescription(embedData?.description || 'Error: No description found.')
		.addFields(fields)
		.setTitle(`Admin Report - CLAIMED (${serverName})`)
		.setURL('https://github.com/iotamale/hll-discord-reports')
		.setColor(colors?.report_claimed || 'green');

	await triggerMsg.edit({
		embeds: [embed.toJSON()],
		components: [row.toJSON()],
	});

	await quickEditReply('You have __claimed__ this report.', 'success', interaction);
	return logger.info(
		`Report #\`${actionId}\` claimed by ${interaction.user.tag} (${interaction.user.id}) in server ${interaction.guild.name} (${interaction.guild.id})`
	);
}
