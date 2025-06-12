# Hel Let Loose Discord Report Bot

This Discord bot is based on [CRCON](https://github.com/MarechJ/hll_rcon_tool). It efficiently scans admin ping messages for reported player names and provides important information to help your admins make quick and informed decisions. It includes details such as player names, Steam IDs, number of team kills, team kill streaks, and total game time on the server.
**As of now, the project is still under development.**

![Preview 1](https://github.com/user-attachments/assets/1f32f74d-d95a-41aa-baf9-0309b8087f7e)

## Instalation

1. Ensure **Node.js v22.12.0** or newer is installed on your system.
2. Install required dependencies by running `npm install` in the project's main folder.
3. Compile the project with `npm run build`.
4. Execute the compiled file by using `node dist/index.js`.

## Configuration
Make a copy of `config_example.json` and rename it to `config.json` . 

|  Variable |  Explanation |
| ------------ | ------------ |
|  `reports_channel_id` | All `!admin` reports will be sent here  |
|  WIP |  WIP |
