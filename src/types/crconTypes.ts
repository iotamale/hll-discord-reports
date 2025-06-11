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