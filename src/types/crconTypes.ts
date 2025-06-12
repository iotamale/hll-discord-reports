export class HllServerConfig {
	name: string;
	displayName: string;
	apiBaseUrl: string;
	websocketUrl: string;
	roles: string[];

	constructor(name: string, displayName: string, apiBaseUrl: string, websocketUrl: string, roles: string[]) {
		this.name = name;
		this.displayName = displayName;
		this.apiBaseUrl = apiBaseUrl;
		this.websocketUrl = websocketUrl;
		this.roles = roles;
	}
}
export class Watchlist {
	reason: string;
	by: string;

	constructor(reason: string, by: string) {
		this.reason = reason;
		this.by = by;
	}
}

export class PlayerStats {
	kills: number;
	deaths: number;
	teamKills: number;
	kpm: number;
	killStreak: number;
	deathStreak: number;
	teamKillStreak: number;

	constructor(
		kills: number = 0,
		deaths: number = 0,
		teamKills: number = 0,
		kpm: number = 0,
		killStreak: number = 0,
		deathStreak: number = 0,
		teamKillStreak: number = 0
	) {
		this.kills = kills;
		this.deaths = deaths;
		this.teamKills = teamKills;
		this.kpm = kpm;
		this.killStreak = killStreak;
		this.deathStreak = deathStreak;
		this.teamKillStreak = teamKillStreak;
	}
}

export class PenaltyCount {
	kick: number;
	punish: number;
	tempban: number;
	permban: number;

	constructor(kick: number, punish: number, tempban: number, permban: number) {
		this.kick = kick;
		this.punish = punish;
		this.tempban = tempban;
		this.permban = permban;
	}
}

export class GamePlayerInfo {
	playerName: string;
	playerId: string;
	sessionsCount: number;
	totalPlayTimeSeconds: number;
	isVip: boolean;
	level: number;
	unitName: string;
	loadout: string;
	team: string;
	role: string;
	watchlist: Watchlist | null;
	stats: PlayerStats | null;
	penaltyCount: PenaltyCount;

	constructor(
		playerName: string,
		playerId: string,
		sessionsCount: number,
		totalPlayTimeSeconds: number,
		isVip: boolean,
		level: number,
		unitName: string,
		loadout: string,
		team: string,
		role: string,
		watchlist: Watchlist | null = null,
		playerStats: PlayerStats | null = null,
		penaltyCount: PenaltyCount
	) {
		this.playerName = playerName;
		this.playerId = playerId;
		this.sessionsCount = sessionsCount;
		this.totalPlayTimeSeconds = totalPlayTimeSeconds;
		this.isVip = isVip;
		this.level = level;
		this.unitName = unitName;
		this.loadout = loadout;
		this.team = team;
		this.role = role;
		this.watchlist = watchlist;
		this.stats = playerStats;
		this.penaltyCount = penaltyCount;
	}
}
