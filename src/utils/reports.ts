import { HllServerConfig, GamePlayerInfo, BasicPlayerInfo } from '../types/crconTypes';
import { CRCONClient } from './crconApiClient';
import { PreparedPlayerInfo } from '../types/reportTypes';
import Fuse from 'fuse.js';
import { getConfigVariable } from '../utils/utils';
import { BaseEmbed } from '../types/messageTypes';
import { BotClient } from '../botClient';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const clanTags = getConfigVariable('clan_tags');
enum Messages {
	noDescription = 'No description provided.',
	reportSent = 'Report sent successfully.',
}

export class FuseResult {
	item: BasicPlayerInfo;
	refIndex: number;
	score: number;

	constructor(item: BasicPlayerInfo, refIndex: number, score: number) {
		this.item = item;
		this.refIndex = refIndex;
		this.score = score;
	}
}

export async function guessPlayer(messageContent: string, server: HllServerConfig, crconClient: CRCONClient): Promise<GamePlayerInfo | null> {
	const playerList = await crconClient.getPlayerList(server);
	if (!playerList || playerList.length === 0) return null;

	const fuse = new Fuse(playerList, {
		keys: ['playerNameParsed'],
		includeScore: true,
		threshold: 0.37,
		minMatchCharLength: 3,
	});

	let results: FuseResult[] = [];
	const words = messageContent.toUpperCase().split(/\s+/);
	for (let word of words) {
		word = word.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '');
		if (clanTags.includes(word)) continue;
		if (word.length < 3) continue;

		const fuseResults = fuse.search(word).map((res) => new FuseResult(res.item, res.refIndex, res.score ?? 0));
		results = [...results, ...fuseResults];
	}

	if (results.length === 0) return null;

	results.sort((a, b) => a.score - b.score);
	const bestMatch = results[0];
	return await crconClient.getPlayerInfo(server, bestMatch.item.playerName);
}

export async function handleReport(authorName: string, authorId: string, messageContent: string, server: HllServerConfig, botClient: BotClient): Promise<void> {
	const crconClient = botClient.crconClient;
	const colors = getConfigVariable('colors');
	const authorData = await crconClient.getPlayerInfo(server, authorName);
	if (!authorData) throw new Error(`Player info for ${authorName} not found.`);
	const preparedAuthorData = new PreparedPlayerInfo(authorData);

	const suspectData = await guessPlayer(messageContent, server, crconClient);

	const embed = new BaseEmbed('info')
		.setTitle(`Admin Report - OPEN (${server.displayName})`)
		//.setAuthor({ name: `Admin Report - OPEN (${server.displayName})`, url: 'https://discord.js.org' })
		.setDescription('**Message:**\n> ' + messageContent)
		.setURL('https://github.com/iotamale/hll-discord-reports')
		.setColor(colors.report_open || 'green')
		.addFields(
			{ name: '\u200B', value: '\u200B', inline: false },
			{ name: 'Reporting player', value: preparedAuthorData.nameField, inline: true },
			{ name: 'ID', value: preparedAuthorData.idField, inline: true },
			{ name: 'Squad', value: preparedAuthorData.squadField, inline: true },
			{ name: 'Playtime', value: preparedAuthorData.playTimeField, inline: true },
			{ name: 'VIP', value: preparedAuthorData.vipStatusField, inline: true },
			{ name: 'Watchlist', value: preparedAuthorData.watchlistField, inline: true },
			{ name: 'Penalty count', value: preparedAuthorData.punishField, inline: true },
			{ name: 'Stats', value: preparedAuthorData.statsField, inline: true },
			{ name: 'Series', value: preparedAuthorData.seriesField, inline: true }
		);

	if (suspectData) {
		const preparedSuspectData = new PreparedPlayerInfo(suspectData);
		embed.addFields(
			{ name: '\u200B', value: '\u200B' },
			{ name: 'Suspected player', value: preparedSuspectData.nameField, inline: true },
			{ name: 'ID', value: preparedSuspectData.idField, inline: true },
			{ name: 'Squad', value: preparedSuspectData.squadField, inline: true },
			{ name: 'Playtime', value: preparedSuspectData.playTimeField, inline: true },
			{ name: 'VIP', value: preparedSuspectData.vipStatusField, inline: true },
			{ name: 'Watchlist', value: preparedSuspectData.watchlistField, inline: true },
			{ name: 'Penalty count', value: preparedSuspectData.punishField, inline: true },
			{ name: 'Stats', value: preparedSuspectData.statsField, inline: true },
			{ name: 'Series', value: preparedSuspectData.seriesField, inline: true }
		);
	} else {
		embed.addFields({ name: '\u200B', value: '\u200B' }, { name: 'Suspected player', value: 'Unknown', inline: true });
	}

	const reportChannelId = getConfigVariable('reports_channel_id');
	const adminRolesString = server.roles.map((role) => `<@&${role}>`).join(' ');
	const channel = await botClient.client.channels.fetch(reportChannelId);

	if (!channel || !channel.isTextBased()) {
		throw new Error(`Report channel with ID ${reportChannelId} not found or is not a text channel.`);
	}
	const textChannel = channel.isTextBased() ? channel : null;
	if (!textChannel) {
		throw new Error(`Report channel with ID ${reportChannelId} is not a text-based channel.`);
	}

	const reportMessage = await (textChannel as any).send({
		content: adminRolesString,
		embeds: [embed],
	});

	const row = new ActionRowBuilder().addComponents([
		new ButtonBuilder().setCustomId(`report-claim:${reportMessage.id}`).setLabel(`Claim`).setStyle(ButtonStyle.Primary),
		new ButtonBuilder().setCustomId(`report-done:${reportMessage.id}`).setLabel(`Done`).setStyle(ButtonStyle.Success),
		new ButtonBuilder().setCustomId(`report-trash:${reportMessage.id}`).setLabel(`Unjustified report`).setStyle(ButtonStyle.Danger),
	]);

	await reportMessage.edit({
		components: [row],
	});
}
