import { Command, Event } from '../types';
import { CommandError } from '../common';
import { Interaction } from 'discord.js';

export class InteractionCreateEvent implements Event {
	public name = 'interactionCreate';

	constructor(private commands: Map<string, Command>) {}

	execute = async (interaction: Interaction): Promise<void> => {
		if (!interaction.isApplicationCommand() || !interaction.inGuild()) {
			return;
		}

		const command = this.commands.get(interaction.commandName);
		if (!command) {
			console.error(`Received unknown command "${interaction.commandName}"!`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (err) {
			if (err instanceof CommandError) {
				await interaction.reply({
					content: err.message,
					ephemeral: true,
				});
			} else {
				console.error('Unhandled error while executing command!', err);
			}
		}
	};
}
