import { CommandError, getChannelSystemOrThrow } from '../common';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { ChannelSettingsRepository } from '../ports/channel-settings-repository';
import { UserSettingsRepository } from '../ports/user-settings-repository';
import { Command, RollResult, System, TurlaczUser } from '../types';
import { SlashCommandBuilder } from '@discordjs/builders';
import { UserSettings } from '../models/user-settings';
import { getTurlaczUser } from './utils';

export class RzutCommand implements Command {
	public data = new SlashCommandBuilder()
	.setName('rzut')
	.setDescription('Rzuca kośćmi zgodnie z podaną formułą.')
	.addStringOption(option =>
		option
		.setName('formuła')
		.setDescription(
			'Formuła matematyczna (+ - * / i nawiasy) wykorzystująca kostki: k2, k4, k6, k8, k10, k12, k20, k100.'
		)
		.setRequired(true)
	)
	.addStringOption(option =>
		option.setName('komentarz').setDescription('Dodatkowy komentarz do rzutu.').setRequired(false)
	);

	constructor(
		private channelSettingsRepository: ChannelSettingsRepository,
		private userSettingsRepository: UserSettingsRepository,
		private systems: Map<string, System>
	) {
	}

	execute = async (interaction: CommandInteraction<'cached'>): Promise<void> => {
		const system = await getChannelSystemOrThrow(
			this.channelSettingsRepository,
			interaction.guildId,
			interaction.channelId
		);
		const user = getTurlaczUser(interaction);

		await interaction.reply({
			embeds: [
				await this.roll(
					interaction.guildId,
					interaction.channelId,
					user,
					system,
					interaction.options.getString('formuła', true),
					interaction.options.getString('komentarz') ?? undefined
				)
			]
		});
	};

	roll = async (
		guildId: string,
		channelId: string,
		user: TurlaczUser,
		systemName: string,
		formula: string,
		comment?: string
	): Promise<MessageEmbed> => {
		const system = this.systems.get(systemName);

		if (!system) {
			throw new CommandError(`System dla tego kanału \`${systemName}\` nie jest rozpoznawalny! Użyj komendy \`/sesja\` aby go ustawić zmienić go na poprawny!`);
		}

		let rollResult: RollResult;
		try {
			rollResult = system.parseFormulaAndRoll(formula);
		}
		catch (err) {
			console.log(`Roll for "${user.displayName}" with "${formula}" failed with error "${err}"!`);

			throw new CommandError(`Formuła \`${formula}\` napotkała błąd!\n\`\`\`${err}\`\`\``);
		}

		await this.saveDiceOptionsForLater(guildId, channelId, user, formula, comment);
		const userSettings = await this.userSettingsRepository.getUserSettings(guildId, channelId, user);

		console.log(`Roll for "${user.displayName}" with "${formula} = ${rollResult.sum}"`);

		const embed = new MessageEmbed();
		embed.setAuthor({
			name: this.getRollAuthor(userSettings, user)
		});
		embed.setThumbnail(this.getRollAvatar(userSettings, user));

		const rollResultColor = system.getRollResultColor(formula, rollResult);
		if (rollResultColor) {
			embed.setColor(rollResultColor);
		}

		const rollResultDisplay = system.getRollResultDisplay(formula, rollResult);
		if (rollResultDisplay) {
			embed.setTitle(rollResultDisplay);
		}

		if (comment) {
			embed.addField('Komentarz', comment, false);
		}

		const rollFormulaWithDiceValues = system.getRollFormulaWithDiceValuesDisplay(formula, rollResult);
		if (rollFormulaWithDiceValues) {
			embed.addField('Kości', rollFormulaWithDiceValues, true);
		}

		embed.addField('Formuła', formula, true);

		return embed;
	};

	private getRollAuthor = (userSettings: UserSettings | null, user: TurlaczUser): string => {
		const nick = userSettings?.nick ?? user.displayName;
		return `${nick} rzuca kością!`;
	};

	private getRollAvatar = (userSettings: UserSettings | null, user: TurlaczUser): string =>
		userSettings?.image ?? user.displayAvatar;

	private saveDiceOptionsForLater = async (
		guildId: string,
		channelId: string,
		user: TurlaczUser,
		formula: string,
		comment?: string
	): Promise<void> => {
		await this.userSettingsRepository.updateUserSettings(guildId, channelId, user, {
			lastDiceOptions: {
				formula,
				comment
			}
		});
	};
}
