import { UserSettingsRepository } from '../ports/user-settings-repository';
import { Command } from '../types';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { getTurlaczUser } from './utils';

export class UstawCommand implements Command {
	public data = new SlashCommandBuilder()
		.setName('ustaw')
		.setDescription('Zmienia ustawienia Turlacza dla użytkownika. Użyj bez argumentów, by wyświetlić obecny stan.')
		.addStringOption(option =>
			option.setName('nick').setDescription('Nick wyświetlany podczas rzutów. Podaj "-" aby usunąć.')
		)
		.addStringOption(option =>
			option.setName('obrazek').setDescription('Obrazek wyświetlany podczas rzutów. Podaj "-" aby usunąć.')
		);

	constructor(private userSettingsRepository: UserSettingsRepository) {}

	execute = async (interaction: CommandInteraction<'cached'>): Promise<void> => {
		const responses = [];

		const nick = interaction.options.getString('nick') ?? undefined;
		const image = interaction.options.getString('obrazek') ?? undefined;
		const user = getTurlaczUser(interaction);

		if (nick !== undefined) {
			if (nick !== '-') {
				await this.userSettingsRepository.updateUserSettings(
					interaction.guildId,
					interaction.channelId,
					user,
					{
						nick,
					}
				);
				console.log(`${user.displayName} set nick to "${nick}"`);

				responses.push(`Zaktualizowano nick na \`${nick}\`.`);
			} else {
				await this.userSettingsRepository.updateUserSettings(
					interaction.guildId,
					interaction.channelId,
					user,
					{
						nick: undefined,
					}
				);
				console.log(`${user.displayName} removed nick`);

				responses.push('Usunięto nick.');
			}
		}

		if (image !== undefined) {
			if (image !== '-') {
				await this.userSettingsRepository.updateUserSettings(
					interaction.guildId,
					interaction.channelId,
					user,
					{
						image,
					}
				);
				console.log(`${user.displayName} set image to "${image}"`);

				responses.push(`Zaktualizowano obrazek na \`${image}\`.`);
			} else {
				await this.userSettingsRepository.updateUserSettings(
					interaction.guildId,
					interaction.channelId,
					user,
					{
						image: undefined,
					}
				);
				console.log(`${user.displayName} removed image`);

				responses.push('Usunięto obrazek.');
			}
		}

		if (responses.length) {
			await interaction.reply({
				content: responses.join('\n'),
				ephemeral: true,
			});
		} else {
			const savedUser = await this.userSettingsRepository.getUserSettings(
				interaction.guildId,
				interaction.channelId,
				user
			);
			const savedNick = savedUser?.nick ?? '-';
			const savedImage = savedUser?.image ?? '-';

			console.log(`${user.displayName} have nick="${savedNick}" image="${savedImage}"`);

			await interaction.reply({
				content: `Nick: \`${savedNick}\`\nObrazek: \`${savedImage}\``,
				ephemeral: true,
			});
		}
	};
}
