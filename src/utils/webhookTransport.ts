import TransportStream from 'winston-transport';
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import { BaseEmbed } from '../types/messageTypes';

interface WebhookTransportOptions {
    webhookUrl: string;
    level?: string;
}

class WebhookTransport extends TransportStream {
    private webhookUrl: string;

    constructor(opts: WebhookTransportOptions) {
        super(opts);
        this.webhookUrl = opts.webhookUrl;
    }

    log(info: any, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        const { level, message, timestamp } = info;
        createLogEmbed(level, message, timestamp).then(embed => {
            this.sendWebhook(embed, 0);
        });

        callback();
    }

    private async sendWebhook(embed: EmbedBuilder, retryCount: number) {
        try {
            await axios.post(this.webhookUrl, {
                embeds: [embed.toJSON()]
            });
        } catch (error) {
            if (axios.isAxiosError(error) && error.response && error.response.status === 429 && retryCount < 5) {
                const retryAfter = error.response.headers['retry-after'] || 1;
                setTimeout(() => {
                    this.sendWebhook(embed, retryCount + 1);
                }, retryAfter * 1000);
            } else {
                console.error('Error sending webhook:', error);
            }
        }
    }
}

export default WebhookTransport;

function createLogEmbed(level: string, message: string, timestamp: string): Promise<BaseEmbed> {
    const embed = new BaseEmbed()
        .setTitle('Log Message')
        .setColor(level === 'error' ? 0xff0000 : 0x00ff00)
        .addFields(
            { name: 'Type', value: level, inline: true },
            { name: 'Log', value: message }
        );
    return Promise.resolve(embed);
}