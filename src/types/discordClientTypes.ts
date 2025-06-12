import { Client, ClientOptions, Collection } from 'discord.js';
import { getConfigVariable } from '../utils/utils';

interface Command {
	data: {
		name: string;
	};
	execute: Function;
}

export class ExtendedClient extends Client {
	commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		// this.hllServers = [];
		this.commands = new Collection();
	}
}
