import { Client, ClientOptions, Collection } from 'discord.js';
import { getConfigVariable } from '../utils/utils';

interface Command {
	data: {
		name: string;
	};
	execute: Function;
}

interface Button {
	data: {
		name: string;
		preventDoubleClick?: boolean;
	};
	execture: Function;
}

export class ExtendedClient extends Client {
	commands: Collection<string, Command>;
	buttons: Collection<string, Button>;

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection();
		this.buttons = new Collection();
	}
}
