import { createLogger, format, transports } from 'winston';
import WebhookTransport from './utils/webhookTransport';
import { getConfigVariable } from './utils/utils';
import { addColors } from 'winston/lib/winston/config';

const webhookUrl = getConfigVariable('LOG_CHANNEL_WEBHOOK');
const nodeType = getConfigVariable('NODE');

const customLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 3,
		http: 4,
		verbose: 5,
		debug: 6,
		silly: 7,
		useraction: 2,
	},
	colors: {
		error: 'red',
		warn: 'yellow',
		info: 'green',
		http: 'magenta',
		verbose: 'cyan',
		debug: 'blue',
		silly: 'grey',
		useraction: 'green',
	},
};

const logger = createLogger({
	levels: customLevels.levels,
	level: 'info',
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
	),
	transports: [
		new transports.Console(),
		new transports.File({ filename: 'logs/combined.log' }),
		new transports.File({ filename: 'logs/error.log', level: 'error' }),
		new transports.File({ filename: 'logs/useraction.log', level: 'useraction' }),
		new WebhookTransport({ webhookUrl, level: 'useraction' }),
	],
});

addColors(customLevels.colors);

export default logger;
