import { HllServerConfig, GamePlayerInfo, BasicPlayerInfo } from '../types/crconTypes';
import { CRCONClient } from './crconApiClient';
import { PreparedPlayerInfo } from '../types/reportTypes';
import Fuse from 'fuse.js';
import { getConfigVariable } from '../utils/utils';
import { BaseEmbed } from '../types/messageTypes';
import { BotClient } from '../botClient';
import { WebhookClient } from 'discord.js';

const clanTags = getConfigVariable('clan_tags');
enum Messages {
	noDescription = 'No description provided.',
	reportSent = 'Report sent successfully.',
}
enum emoji {
	orange = '🟧',
	check = '✅',
	trash = '🗑️',
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
	const authorData = await crconClient.getPlayerInfo(server, authorName);
	if (!authorData) throw new Error(`Player info for ${authorName} not found.`);
	const preparedAuthorData = new PreparedPlayerInfo(authorData);

	const suspectData = await guessPlayer(messageContent, server, crconClient);
	console.log(suspectData);

	const embed = new BaseEmbed('info')
		.setTitle(`Admin Report - OPEN (${server.displayName})`)
		//.setAuthor({ name: `Admin Report - OPEN (${server.displayName})`, url: 'https://discord.js.org' })
		.setDescription(messageContent)
		.setURL('https://github.com/iotamale/hll-discord-reports')
		.addBlankField()
		.addFields(
			{ name: '\u200B', value: '\u200B' },
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

	const webhookUrl = getConfigVariable('log_channel_webhook');
	if (!webhookUrl) throw new Error('Report webhook URL not configured.');
	const webhookClient = new WebhookClient({ url: webhookUrl });
	await webhookClient.send({ embeds: [embed] });
}
