import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from "../logger";

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
    logger.useraction('Ping command executed successfully.');
}