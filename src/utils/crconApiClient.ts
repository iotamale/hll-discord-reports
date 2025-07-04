import { getConfigVariable } from './utils';
import axios, { Axios, AxiosResponse } from 'axios';
import logger from '../logger';
import { HllServerConfig, GamePlayerInfo, PlayerStats, Watchlist, PenaltyCount, BasicPlayerInfo } from '../types/crconTypes';

export class CRCONClient {
	public readonly hllServers: Array<HllServerConfig>;
	private readonly headers: any;
	private readonly rconApiKey: string = getConfigVariable('RCON_API_KEY');

	constructor() {
		this.hllServers = [];
		const hllServersData = getConfigVariable('servers');
		for (const serverData of hllServersData) {
			const hllServer = new HllServerConfig(serverData.name, serverData.display_name, serverData.api_base_url, serverData.websocket_url, serverData.roles);
			this.hllServers.push(hllServer);
		}
		this.headers = {
			authorization: `Bearer ${this.rconApiKey}`,
			'content-type': 'application/json',
		};
	}

	public async getGameState(server: HllServerConfig): Promise<AxiosResponse> {
		const url = server.apiBaseUrl;
		try {
			const response = await axios.get(`${url}/get_gamestate`, { headers: this.headers });
			return response;
		} catch (error) {
			logger.error('Error fetching server info:', error);
			return Promise.reject(new Error('Error fetching server info'));
		}
	}

	public async getPlayerList(server: HllServerConfig): Promise<BasicPlayerInfo[]> {
		const url = server.apiBaseUrl;
		try {
			const response = await axios.get(`${url}/get_playerids`, { headers: this.headers });
			let res: BasicPlayerInfo[] = [];
			for (const player of response?.data?.result) {
				const playerData = new BasicPlayerInfo(player[0], player[1]);
				res.push(playerData);
			}
			return res;
		} catch (error) {
			logger.error('Error fetching server info:', error);
			return Promise.reject(new Error('Error fetching server info'));
		}
	}

	public async getPlayerStats(server: HllServerConfig, playerName: string): Promise<PlayerStats | null> {
		const url = server.apiBaseUrl;
		try {
			const response = await axios.get(`${url}/get_live_game_stats`, { headers: this.headers });
			if (response.status !== 200) {
				logger.error(`Failed to fetch player stats for ${playerName} from ${url}. Status code: ${response.status}`);
				return Promise.reject(new Error('Failed to fetch player stats'));
			}
			const data = response?.data?.result?.stats.filter((x: any) => x.player === playerName)[0];
			if (!data) {
				logger.warn(`No stats found for player ${playerName} on server ${url}`);
				return null;
			}
			return new PlayerStats(
				data.kills,
				data.deaths,
				data.teamkills,
				data.kills_per_minute,
				data.kills_streak,
				data.deaths_without_kill_streak,
				data.teamkills_streak
			);
		} catch (error) {
			logger.error('Error fetching server info:', error);
			return Promise.reject(new Error('Error fetching server info'));
		}
	}

	public async getPlayerInfo(server: HllServerConfig, playerName: string): Promise<GamePlayerInfo | null> {
		const url = server.apiBaseUrl;
		try {
			const response = await axios.get(`${url}/get_detailed_player_info?player_name=${playerName}`, { headers: this.headers });
			if (response.status !== 200 || !response?.data?.result) {
				logger.error(`Failed to fetch player info for ${playerName} from ${url}. Status code: ${response.status}`);
				return Promise.reject(new Error(`Failed to fetch player info for ${playerName}`));
			}
			const data = response?.data?.result;
			const watchData = data?.profile?.watchlist;
			const watchlist = watchData ? new Watchlist(watchData.reason, watchData.by) : null;

			const playerStats = await this.getPlayerStats(server, playerName);
			return new GamePlayerInfo(
				data.name,
				data.player_id,
				data.profile.sessions_count,
				data.profile.total_playtime_seconds,
				data.is_vip,
				data.level,
				data.unit_name,
				data.loadout,
				data.team,
				data.role,
				watchlist,
				playerStats,
				new PenaltyCount(
					data?.profile?.penalty_count?.KICK,
					data?.profile?.penalty_count?.PUNISH,
					data?.profile?.penalty_count?.TEMPBAN,
					data?.profile?.penalty_count?.PERMABAN
				)
			);
		} catch (error) {
			logger.error('Error fetching server info:', error);
			return Promise.reject(new Error('Error fetching server info'));
		}
	}
}
