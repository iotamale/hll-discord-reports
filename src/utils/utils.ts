const config = require('../../config.json');
import { Base, CommandInteraction, Message, MessageFlags } from 'discord.js';
import { BaseEmbed } from '../types/messageTypes';

export function getConfigVariable(name: string): any {
	const value = config[name.toLocaleLowerCase()];
	if (!value) {
		throw new Error(`${name} is not defined in the config file.`);
	}
	return value;
}

export async function quickEditReply(content: string, type: 'info' | 'warning' | 'error' | 'success', interaction: CommandInteraction): Promise<Message> {
	let emoji = '';
	if (type === 'error') {
		emoji = ':x: ';
	} else if (type === 'warning') {
		emoji = ':warning: ';
	} else if (type === 'success') {
		emoji = `:white_check_mark: `;
	}

	const embed = new BaseEmbed(type, false).setDescription(`${emoji}${content}`);
	return await interaction.editReply({
		embeds: [embed],
	});
}
