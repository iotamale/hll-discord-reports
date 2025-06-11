import { EmbedBuilder } from "discord.js";

export enum EmbedType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Success = 'success'
}

export class BaseEmbed extends EmbedBuilder {

    constructor(type: 'info' | 'warning' | 'error' | 'success' = 'info') {
        super();
        this.setColor(0x0099FF);
        this.setTimestamp();
        this.setFooter({ text: 'Created by iotamale' });
    }

    public addBlankField() {
        this.addFields(
            { name: "\u200B", value: "\u200B", inline: true },
        );
        return this;
    }
}