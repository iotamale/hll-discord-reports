import { HllServerConfig, GamePlayerInfo } from '../types/crconTypes';
import { CRCONClient } from './crconApiClient';
import { PreparedPlayerInfo } from '../types/reportTypes';

export async function handleReport(authorName: string, authorId: string, messageContent: string, server: HllServerConfig, crconClient: CRCONClient): Promise<void> {
	const authorData = await crconClient.getPlayerInfo(server.apiBaseUrl, authorName);
	if (!authorData) {
		throw new Error(`Player info for ${authorName} not found.`);
	}
	const preparedAuthorData = new PreparedPlayerInfo(authorData);
}
