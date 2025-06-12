import { getConfigVariable } from './utils';
import axios, { Axios, AxiosResponse } from 'axios';
import logger from '../logger';
import { HllServerConfig, GamePlayerInfo, PlayerStats, Watchlist } from '../types/crconTypes';

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

	public async getGameState(url: string): Promise<AxiosResponse> {
		try {
			const response = await axios.get(`${url}/get_gamestate`, { headers: this.headers });
			return response;
		} catch (error) {
			logger.error('Error fetching server info:', error);
			throw new Error('Error fetching server info');
		}
	}

	public async getPlayerStats(url: string, playerName: string): Promise<PlayerStats | null> {
		try {
			const response = await axios.get(`${url}/get_live_game_stats`, { headers: this.headers });
			if (response.status !== 200) {
				logger.error(`Failed to fetch player stats for ${playerName} from ${url}. Status code: ${response.status}`);
				throw new Error(`Failed to fetch player stats for ${playerName}`);
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
			throw new Error('Error fetching server info');
		}
	}

	public async getPlayerInfo(url: string, playerName: string): Promise<GamePlayerInfo | null> {
		// let response: AxiosResponse;
		try {
			const response = await axios.get(`${url}/get_detailed_player_info?player_name=${playerName}`, { headers: this.headers });
			if (response.status !== 200) {
				logger.error(`Failed to fetch player info for ${playerName} from ${url}. Status code: ${response.status}`);
				throw new Error(`Failed to fetch player info for ${playerName}`);
			}
			const data = response?.data?.result;
			const watchData = data?.profile?.watchlist;
			const watchlist = watchData ? new Watchlist(watchData.reason, watchData.by) : null;

			const playerStats = await this.getPlayerStats(url, playerName);
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
				data.profile.penalty_count || null
			);
		} catch (error) {
			logger.error('Error fetching server info:', error);
			throw new Error('Error fetching server info');
		}
	}
}
