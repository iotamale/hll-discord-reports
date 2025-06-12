import { GatewayIntentBits, TextChannel } from 'discord.js';
import fs from 'fs';
import logger from './logger';
import path from 'path';
import { ExtendedClient } from './types/discordClientTypes';
import { deployCommands } from './deployCommands';
import { BotClient } from './botClient';
// import { m_1 } from './utils/timeUtils';
import { BaseEmbed } from './types/messageTypes';
const config = require('../config.json');

const client = new ExtendedClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers],
});

// Set up the client commands collection
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
logger.info(`Command files: ${commandFiles}`);

for (const file of commandFiles) {
	logger.info(`Loading command: ${file}`);
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Set up the client buttons collection
const buttonsPath = path.join(__dirname, 'components', 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter((file) => file.endsWith('.js'));
logger.info(`Button files: ${buttonFiles}`);

for (const file of buttonFiles) {
	logger.info(`Loading button: ${file}`);
	const filePath = path.join(buttonsPath, file);
	const button = require(filePath);
	client.buttons.set(button.data.name, button);
}

let botClient: BotClient;

client.once('ready', async () => {
	logger.info('Bot is online!');

	// Log the servers the bot is connected to
	client.guilds.cache.forEach((guild) => {
		logger.info(`Connected to server: ${guild.name}, ${guild.id}`);
	});

	client.guilds.cache.forEach((guild) => {
		deployCommands(commandFiles, commandsPath, guild.id);
	});

	botClient = new BotClient(client);
	await botClient.connectToWebsockets();
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isChatInputCommand() && interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) {
			logger.error(`No command matching ${interaction.commandName} was found.`);
			return interaction.reply({ content: 'This command does not exist.', ephemeral: true });
		}

		try {
			await command.execute(interaction, botClient);
		} catch (error) {
			logger.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if (interaction.isButton()) {
		const { customId } = interaction;
		const [buttonClass, actionId] = customId.split(':');

		const button = client.buttons.get(buttonClass);
		const clickedButtons = client.clickedButtons;
		await interaction.deferReply({ ephemeral: true });
		if (!button) return new Error('There is no code for this button.');

		try {
			if (button?.data?.preventDoubleClick) {
				const clicked = clickedButtons.get(actionId);
				if (clicked) {
					return await interaction.editReply({
						content: 'This button has already been clicked by another user. Please try again later.',
					});
				}
				clickedButtons.set(actionId, true);
				setTimeout(() => {
					clickedButtons.delete(actionId);
				}, 3000);
			}
			await button.execute(interaction, client, actionId);
			clickedButtons.delete(actionId);
		} catch (error) {
			console.log(error);
		}
	}
});

client.login(config.discord_token);
