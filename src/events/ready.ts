import { Command, Event } from '../types';
import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

export class ReadyEvent implements Event {
	public name = 'ready';

	public once = true;

	constructor(private token: string, private guildId: string | null, private commands: Map<string, Command>) {}

	execute = async (client: Client<true>): Promise<void> => {
		console.info(`Logged in as ${client.user.tag}`);

		const rest = new REST({ version: '9' }).setToken(this.token);

		try {
			let routes;

			if (this.guildId) {
				routes = Routes.applicationGuildCommands(client.user.id, this.guildId);
				console.log(`Using guild "${process.env.DISCORD_GUILD_ID}" commands`);
			} else {
				routes = Routes.applicationCommands(client.user.id);
				console.log(`Using global commands`);
			}

			await rest.put(routes, {
				body: Array.from(this.commands, ([, command]) => command.data.toJSON()),
			});

			console.log(`Commands updated`);
		} catch (err) {
			console.error(`Error in updating commands!`, err);
		}
	};
}
