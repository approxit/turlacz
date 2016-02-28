import { ChannelSettingsRepository } from '../ports/channel-settings-repository';
import { Command, System } from '../types';
import { CommandInteraction } from 'discord.js';
import { CommandError } from '../common';
import { SlashCommandBuilder } from '@discordjs/builders';

export class SesjaCommand implements Command {
	public get data() {
		return new SlashCommandBuilder()
			.setName('sesja')
			.setDescription(
				'Zmienia ustawienia Turlacza dla aktualnego kanału. Użyj bez argumentów, by wyświetlić obecny stan.'
			)
			.addStringOption(option => {
				option
					.setName('system')
					.setDescription('System RPG, który będzie aktywny na kanale. Podaj "-" aby usunąć.');

				for (const [systemCode, system] of this.systems) {
					option.addChoice(system.name, systemCode);
				}

				option.addChoice('-', '-');
				return option;
			});
	}

	constructor(private channelSettingsRepository: ChannelSettingsRepository, private systems: Map<string, System>) {}

	execute = async (interaction: CommandInteraction<'cached'>): Promise<void> => {
		const responses = [];
		const system = interaction.options.getString('system') ?? undefined;

		if (system !== undefined) {
			if (system !== '-') {
				await this.channelSettingsRepository.updateChannelSettings(interaction.guildId, interaction.channelId, {
					system,
				});

				const selectedSystem = this.systems.get(system);
				if (!selectedSystem) {
					throw new CommandError(`Nie odnaleziono systemu "${system}"!`);
				}

				console.log(`${interaction.user.username} set system to "${selectedSystem.name}"`);

				responses.push(`Zaktualizowano system na \`${selectedSystem.name}\`.`);
			} else {
				await this.channelSettingsRepository.updateChannelSettings(interaction.guildId, interaction.channelId, {
					system: null,
				});
				console.log(`${interaction.user.username} removed system`);

				responses.push('Usunięto system.');
			}
		}

		if (responses.length) {
			await interaction.reply({
				content: responses.join('\n'),
				ephemeral: true,
			});
		} else {
			const channel = await this.channelSettingsRepository.getChannelSettings(
				interaction.guildId,
				interaction.channelId
			);

			const systemName = channel?.system ? this.systems.get(channel.system)?.name : '-';
			console.log(`${interaction.user.username} have system="${systemName}"`);

			await interaction.reply({
				content: `System: \`${systemName}\``,
				ephemeral: true,
			});
		}
	};
}
