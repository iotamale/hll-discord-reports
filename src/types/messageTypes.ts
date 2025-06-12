import { EmbedBuilder } from 'discord.js';
const config = require('../../config.json');
const colors = config.colors;

export enum EmbedType {
	Info = 'info',
	Warning = 'warning',
	Error = 'error',
	Success = 'success',
}

export class BaseEmbed extends EmbedBuilder {
	constructor(type: 'info' | 'warning' | 'error' | 'success' = 'info', footer: boolean = true) {
		super();
		this.setColor(colors[type] || colors.info);
		if (footer) {
			this.setFooter({ text: 'Created by iotamale' });
			this.setTimestamp();
		}
	}

	public addBlankField() {
		this.addFields({ name: '\u200B', value: '\u200B', inline: true });
		return this;
	}
}
