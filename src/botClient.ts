import { ExtendedClient, HllServerConfig } from './types/discordClientTypes';

export class BotClient {
    // private readonly voiceChannelIds: Array<string>;
    // private readonly rconUrls: Array<string>;
    private readonly client: ExtendedClient;
    // private readonly crconClient: CRCONClient;

    constructor(client: ExtendedClient) {
        this.client = client;
        // this.crconClient = new CRCONClient();
    };
}