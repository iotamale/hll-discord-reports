import { GamePlayerInfo } from './crconTypes';

export class PreparedPlayerInfo {
	nameField: string;
	idField: string;
	squadField: string;
	playTimeField: string;
	vipStatusField: string;
	watchlistField: string;
	punishField: string;
	statsField: string;
	seriesField: string;

	constructor(player: GamePlayerInfo) {
		const hours = Math.floor(player.totalPlayTimeSeconds / 3600);
		const minutes = Math.floor((player.totalPlayTimeSeconds % 3600) / 60);
		this.nameField = `${player.playerName} (${player.level})`;
		this.idField = player.playerId;
		this.squadField = `${player.team.charAt(0).toUpperCase() + player.team.slice(1)} | ${player.unitName.toUpperCase()} | ${
			player.role.charAt(0).toUpperCase() + player.role.slice(1)
		}`;
		this.playTimeField = `${hours}h ${minutes}m | ${player.sessionsCount} sessions`;
		this.vipStatusField = player.isVip ? 'Yes' : 'No';
		this.watchlistField = player.watchlist ? `${player.watchlist.reason} | ${player.watchlist.by}` : '-';
		this.punishField = `Ban: ${player.penaltyCount?.tempban + player.penaltyCount.permban} | Kick: ${player.penaltyCount.kick} | Punish: ${
			player.penaltyCount.punish
		}`;
		this.statsField = `K: ${player.stats?.kills} | D: ${player.stats?.deaths} | TK: ${player.stats?.teamKills}`;
		this.seriesField = `K: ${player.stats?.killStreak} | D: ${player.stats?.deathStreak} | TK: ${player.stats?.teamKillStreak}`;
	}
}
