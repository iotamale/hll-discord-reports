import { getConfigVariable } from './utils/utils';
import axios, { Axios, AxiosResponse } from 'axios';
import logger from './logger';
import { ExtendedClient } from './types/discordClientTypes';
import { HllServerConfig } from './types/crconTypes';

export class CRCONClient {
    public readonly hllServers: Array<HllServerConfig>;
    private readonly headers: any;
    private readonly rconApiKey: string = getConfigVariable('RCON_API_KEY');

    constructor() {
        this.hllServers = [];
        const hllServersData = getConfigVariable('servers');
        for (const serverData of hllServersData) {
            const hllServer = new HllServerConfig(serverData.name, serverData.display_name, serverData.api_base_url, serverData.websocket_url, serverData.roles);
            this.hllServers.push(hllServer);
        }
        this.headers = {
            'authorization': `Bearer ${this.rconApiKey}`,
            'content-type': 'application/json'
        };
    }

    public async getGameState(url: string): Promise<AxiosResponse> {
        try {
            const response = await axios.get(`${url}/get_gamestate`, { headers: this.headers });
            return response;
        } catch (error) {
            logger.error('Error fetching server info:', error);
            throw new Error('Error fetching server info');
        }
    };
};