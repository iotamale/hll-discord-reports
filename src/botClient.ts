import { ExtendedClient } from './types/discordClientTypes';
import { HllServerConfig } from './types/crconTypes';
import { CRCONClient } from './crconApiClient';

export class BotClient {
    // private readonly voiceChannelIds: Array<string>;
    // private readonly rconUrls: Array<string>;
    private readonly client: ExtendedClient;
    public readonly crconClient: CRCONClient;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.crconClient = new CRCONClient();
    };
}