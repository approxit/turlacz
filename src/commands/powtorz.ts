import { CommandError, getChannelSystemOrThrow } from '../common';
import { UserSettingsRepository } from '../ports/user-settings-repository';
import { ChannelSettingsRepository } from '../ports/channel-settings-repository';
import { Command } from '../types';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { RzutCommand } from './rzut';

export class PowtorzCommand implements Command {
	public data = new SlashCommandBuilder()
	.setName('powtorz')
	.setDescription('Ponownie wykonuje Twój ostatni rzut.')
	.addStringOption(option =>
		option
		.setName('komentarz')
		.setDescription('Dodatkowy komentarz do rzutu, jeśli ma być inny niż z ostatniego rzutu.')
	);

	constructor(
		private channelSettingsRepository: ChannelSettingsRepository,
		private userSettingsRepository: UserSettingsRepository,
		private commands: Map<string, Command>
	) {
	}

	execute = async (interaction: CommandInteraction<'cached'>): Promise<void> => {
		const system = await getChannelSystemOrThrow(
			this.channelSettingsRepository,
			interaction.guildId,
			interaction.channelId
		);

		const comment = interaction.options.getString('komentarz') ?? undefined;

		const userSettings = await this.userSettingsRepository.getUserSettings(
			interaction.guildId,
			interaction.channelId,
			interaction.user
		);

		if (!userSettings?.lastDiceOptions) {
			console.log(`No previous rolls from "${interaction.user.username}"!`);

			throw new CommandError('Nie masz jeszcze wykonanych rzutów, wykonaj jakiś!');
		}

		const command = this.commands.get('rzut') as RzutCommand | undefined;
		if (!command) {
			throw new CommandError('Nie odnaleziono komendy "rzut", by wykonać ją ponownie!');
		}

		await interaction.reply({
			embeds: [
				await command.roll(
					interaction.guildId,
					interaction.channelId,
					interaction.user,
					system,
					userSettings.lastDiceOptions.formula,
					comment || userSettings.lastDiceOptions?.comment
				)
			]
		});
	};
}
