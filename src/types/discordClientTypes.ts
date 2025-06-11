import { Client, ClientOptions, Collection } from 'discord.js';
import { getConfigVariable } from '../utils/utils';

interface Command {
    data: {
        name: string;
    };
    execute: Function;
}

export class HllServerConfig {
    name: string;
    displayName: string;
    rconUrl: string;
    isPtfoServer: boolean;
    statusChannelId: string;

    constructor(name: string, displayName: string, rconUrl: string, isPtfoServer: boolean, statusChannelId: string) {
        this.name = name;
        this.displayName = displayName;
        this.rconUrl = rconUrl;
        this.isPtfoServer = isPtfoServer;
        this.statusChannelId = statusChannelId;
    }
}

export class ExtendedClient extends Client {
    commands: Collection<string, Command>;
    hllServers: Array<HllServerConfig>;

    constructor(options: ClientOptions) {
        super(options);
        this.hllServers = [];
        this.commands = new Collection();
    }
}