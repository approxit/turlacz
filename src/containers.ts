import { MongoDbChannelSettingsRepository } from './adapters/mongodb/channel-settings-repository';
import { MongoDbUserSettingsRepository } from './adapters/mongodb/user-settings-repository';
import { MongoClient } from 'mongodb';
import { Command, Event, System } from './types';
import { alien } from './systems/alien';
import { dnd } from './systems/dnd';
import { generic } from './systems/generic';
import { tal } from './systems/tal';
import { Memoize } from 'typescript-memoize';
import { ReadyEvent } from './events/ready';
import { InteractionCreateEvent } from './events/interaction-create';
import { PowtorzCommand } from './commands/powtorz';
import { RzutCommand } from './commands/rzut';
import { SesjaCommand } from './commands/sesja';
import { UstawCommand } from './commands/ustaw';
import { Client, Intents } from 'discord.js';

export class ApplicationContainer {
	get mongoUri() {
		return process.env.MONGODB_URI ?? 'mongodb://localhost';
	}

	get discordToken() {
		if (!process.env.DISCORD_TOKEN) {
			throw Error(`Environment variable "DISCORD_TOKEN" must be defined!`);
		}

		return process.env.DISCORD_TOKEN;
	}

	get discordGuildId() {
		return process.env.DISCORD_GUILD_ID ?? null;
	}

	get mongoClient() {
		return new MongoClient(this.mongoUri, {
			serverSelectionTimeoutMS: 5000,
		});
	}

	@Memoize()
	get channelSettingsRepository() {
		return new MongoDbChannelSettingsRepository(this.mongoClient);
	}

	@Memoize()
	get userSettingsRepository() {
		return new MongoDbUserSettingsRepository(this.mongoClient);
	}

	@Memoize()
	get systems() {
		return new Map<string, System>([
			['alien', alien],
			['dnd', dnd],
			['generic', generic],
			['tal', tal],
		]);
	}

	@Memoize()
	get commands() {
		// Return empty object then modify it later to handle self-reference
		return new Map<string, Command>();
	}

	@Memoize()
	get events() {
		return new Map<string, Event>([
			['ready', new ReadyEvent(this.discordToken, this.discordGuildId, this.commands)],
			['interaction-create', new InteractionCreateEvent(this.commands)],
		]);
	}

	@Memoize()
	get discordClient() {
		const client = new Client({
			intents: [Intents.FLAGS.GUILDS],
		});

		for (const event of this.events.values()) {
			if (event.once) {
				client.once(event.name, event.execute);
			} else {
				client.on(event.name, event.execute);
			}
		}

		return client;
	}

	constructor() {
		this.commands.set(
			'powtorz',
			new PowtorzCommand(this.channelSettingsRepository, this.userSettingsRepository, this.commands)
		);
		this.commands.set(
			'rzut',
			new RzutCommand(this.channelSettingsRepository, this.userSettingsRepository, this.systems)
		);
		this.commands.set('sesja', new SesjaCommand(this.channelSettingsRepository, this.systems));
		this.commands.set('ustaw', new UstawCommand(this.userSettingsRepository));
	}

	async main() {
		await this.discordClient.login(this.discordToken);
	}
}
