const config = require('../../config.json');

export function getConfigVariable(name: string): any {
    const value = config[name.toLocaleLowerCase()];
    if (!value) {
        throw new Error(`${name} is not defined in the config file.`);
    }
    return value;
}