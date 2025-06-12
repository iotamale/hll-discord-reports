import { ExtendedClient } from './types/discordClientTypes';
import { HllServerConfig } from './types/crconTypes';
import { CRCONClient } from './utils/crconApiClient';
import logger from './logger';
import { WebSocketClient } from './utils/websocketClient';
const WebSocket = require('ws');

export class BotClient {
	// private readonly voiceChannelIds: Array<string>;
	// private readonly rconUrls: Array<string>;
	private readonly client: ExtendedClient;
	public readonly crconClient: CRCONClient;

	constructor(client: ExtendedClient) {
		this.client = client;
		this.crconClient = new CRCONClient();
	}

	public async connectToWebsockets(): Promise<void> {
		const hllServers: Array<HllServerConfig> = this.crconClient.hllServers;
		logger.info(`Connecting to ${hllServers.length} HLL servers...`);
		for (const server of this.crconClient.hllServers) {
			const ws = new WebSocketClient(server);
			ws.connect();
		}
	}

	// public async establishhWebsocketConnection(server: HllServerConfig): Promise<void> {}
}
