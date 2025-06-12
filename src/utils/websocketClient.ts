import logger from '../logger';
import { WebSocket } from 'ws';
import type { Data } from 'ws';
import { HllServerConfig } from '../types/crconTypes';
import { getConfigVariable } from './utils';
import { handleReport } from './reports';
import { CRCONClient } from './crconApiClient';
import { BotClient } from '../botClient';

export class WebSocketClient {
	private readonly server: HllServerConfig;
	private readonly rconApiKey: string = getConfigVariable('RCON_API_KEY');
	private ws: WebSocket | null = null;
	private isAlive: boolean = false;
	private heartbeatInterval: NodeJS.Timeout | null = null;
	private crconClient: CRCONClient;
	private botClient: BotClient;

	constructor(server: HllServerConfig, botClient: BotClient) {
		this.server = server;
		this.heartbeat = this.heartbeat.bind(this);
		this.checkConnection = this.checkConnection.bind(this);
		this.connect = this.connect.bind(this);
		this.crconClient = botClient.crconClient;
		this.botClient = botClient;
	}

	private heartbeat(): void {
		this.isAlive = true;
	}

	private checkConnection(): void {
		if (this.ws === null) return;
		if (!this.isAlive) {
			logger.info(`Websocket ${this.server.name || null} connection terminated, reconnecting...`);
			this.disconnect();
			return;
		}

		this.isAlive = false;
		this.ws.ping();
	}

	public connect(): void {
		if (this.ws !== null) {
			logger.warn(`WebSocket for ${this.server.name} is already connected.`);
			return;
		}
		if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

		this.ws = new WebSocket(this.server.websocketUrl, {
			headers: {
				Authorization: `Bearer ${this.rconApiKey}`,
			},
		});

		this.ws.on('open', () => {
			logger.info(`WebSocket connected to ${this.server.name}`);
			if (this.ws !== null) {
				this.ws.send(JSON.stringify({ last_seen_id: null, actions: ['CHAT'] }));
				this.isAlive = true;
				this.heartbeatInterval = setInterval(this.checkConnection, 3000);
			}
		});
		this.ws.on('ping', this.heartbeat);
		this.ws.on('pong', this.heartbeat);
		this.ws.on('message', (data: string) => {
			logger.debug(`Message from ${this.server.name}: ${data}`);
			const message = JSON.parse(data);
			for (const log of message?.logs) {
				const playerMessage = log?.log?.sub_content;
				if (playerMessage.toLowerCase().startsWith('!admin')) {
					handleReport(log?.log?.player_name_1, log?.log?.player_id_1, playerMessage, this.server, this.botClient);
				}
			}
		});

		this.ws.on('error', (error: Error) => {
			logger.error(`WebSocket error for ${this.server.name}: ${error.message}`);
			this.checkConnection();
		});

		this.ws.on('close', () => {
			logger.info(`WebSocket connection to ${this.server.name} closed.`);
			if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
			this.ws = null;
		});
	}

	public disconnect(): void {
		if (this.ws !== null) {
			this.ws.close();
			this.ws = null;
			logger.info(`WebSocket disconnected from ${this.server.name}`);
			this.isAlive = false;
			if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
			setTimeout(() => this.connect(), 5000);
		} else {
			logger.warn(`No active WebSocket connection to disconnect for ${this.server.name}`);
		}
	}
}
