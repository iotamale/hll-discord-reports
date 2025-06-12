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
	execute: Function;
}

export class ExtendedClient extends Client {
	commands: Collection<string, Command> = new Collection();
	buttons: Collection<string, Button> = new Collection();
	clickedButtons: Collection<string, boolean> = new Collection();

	constructor(options: ClientOptions) {
		super(options);
	}
}
