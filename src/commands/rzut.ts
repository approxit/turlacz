import { CommandError, getChannelSystemOrThrow } from '../common';
import { CommandInteraction, MessageEmbed, User } from 'discord.js';
import { ChannelSettingsRepository } from '../ports/channel-settings-repository';
import { UserSettingsRepository } from '../ports/user-settings-repository';
import { Command, RollResult, System } from '../types';
import { SlashCommandBuilder } from '@discordjs/builders';
import { UserSettings } from '../models/user-settings';
import { parse } from '../adapters/pegjs/dice.cjs';

const critical_up_mark = ':star:';
const critical_up_color = 'ORANGE';
const critical_down_mark = ':boom:';
const critical_down_color = 'RED';

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
	) {}

	execute = async (interaction: CommandInteraction<'cached'>): Promise<void> => {
		const system = await getChannelSystemOrThrow(
			this.channelSettingsRepository,
			interaction.guildId,
			interaction.channelId
		);

		await interaction.reply({
			embeds: [
				await this.roll(
					interaction.guildId,
					interaction.channelId,
					interaction.user,
					system,
					interaction.options.getString('formuła', true),
					interaction.options.getString('komentarz') ?? undefined
				),
			],
		});
	};

	roll = async (
		guildId: string,
		channelId: string,
		user: User,
		system: string,
		formula: string,
		comment?: string
	): Promise<MessageEmbed> => {
		const rollRollOptions = {
			diceExplosion: this.systems.get(system)?.diceExplosion,
		};
		let rollResult: RollResult;
		try {
			rollResult = parse(formula, rollRollOptions);
		} catch (err) {
			console.log(`Roll for "${user.username}" with "${formula}" failed with error "${err}"!`);

			throw new CommandError(`Formuła \`${formula}\` napotkała błąd!\n\`\`\`${err}\`\`\``);
		}

		await this.saveDiceOptionsForLater(guildId, channelId, user, formula, comment);
		const userSettings = await this.userSettingsRepository.getUserSettings(guildId, channelId, user);

		const rollAuthor = this.getRollAuthor(userSettings, user);
		const rollAvatar = this.getRollAvatar(userSettings, user);
		const rollFormulaRaw = this.getRollFormulaWithRawDiceRolls(formula, rollResult);
		const rollFormulaSums = this.getRollFormulaWithSumDiceRolls(formula, rollResult);
		const rollFormulaResult = this.getRollFormulaResult(rollResult, rollFormulaSums);

		console.log(`Roll for "${user.username}" with "${formula} = ${rollResult.sum}"`);

		const embed = new MessageEmbed();
		embed.setAuthor(rollAuthor);
		embed.setThumbnail(rollAvatar);
		embed.setTitle(rollFormulaResult);

		if (rollResult.flags !== null) {
			embed.setColor(rollResult.flags ? critical_up_color : critical_down_color);
		}

		if (comment) {
			embed.addField('Komentarz', comment, false);
		}

		if (1 < rollResult.rollCount && rollResult.rollCount !== rollResult.rollSets.length) {
			embed.addField('Kości', rollFormulaRaw, true);
		}

		embed.addField('Formuła', formula, true);

		return embed;
	};

	private getRollAuthor = (userSettings: UserSettings | null, user: User): string => {
		const nick = userSettings?.nick ?? user.username;
		return `${nick} rzuca kością!`;
	};

	private getRollAvatar = (userSettings: UserSettings | null, user: User): string =>
		userSettings?.image ?? user.displayAvatarURL();

	private getRollFormulaWithRawDiceRolls = (formula: string, rollResult: RollResult): string => {
		let result = formula;

		for (let i = rollResult.rollSets.length - 1; 0 <= i; --i) {
			const rollSet = rollResult.rollSets[i];
			const rolls = rollSet.rolls.map(r => {
				return this.getValueWithCriticalMark(r.value, r.flags);
			});
			const diceRollsStr = '[' + rolls.join(', ') + ']';
			result = result.substr(0, rollSet.range[0]) + diceRollsStr + result.substr(rollSet.range[1], result.length);
		}

		return result;
	};

	private getRollFormulaWithSumDiceRolls = (formula: string, rollResult: RollResult): string => {
		let result = formula;

		for (let i = rollResult.rollSets.length - 1; 0 <= i; --i) {
			const rollSet = rollResult.rollSets[i];
			const diceRollsStr = this.getValueWithCriticalMark(rollSet.sum, rollSet.flags);
			result = result.substr(0, rollSet.range[0]) + diceRollsStr + result.substr(rollSet.range[1], result.length);
		}

		return result;
	};

	private getRollFormulaResult = (rollResult: RollResult, rollFormulaSums: string): string => {
		const sum = this.getValueWithCriticalMark(rollResult.sum, rollResult.flags);

		if (sum === rollFormulaSums || !rollResult.rollCount) {
			return `**${sum}**`;
		} else {
			return `${rollFormulaSums} = **${sum}**`;
		}
	};

	private getValueWithCriticalMark = (value: number, flags: any): string => {
		if (flags !== null) {
			return value + (flags ? critical_up_mark : critical_down_mark);
		} else {
			return value + '';
		}
	};

	private saveDiceOptionsForLater = async (
		guildId: string,
		channelId: string,
		user: User,
		formula: string,
		comment?: string
	): Promise<void> => {
		await this.userSettingsRepository.updateUserSettings(guildId, channelId, user, {
			lastDiceOptions: {
				formula,
				comment,
			},
		});
	};
}
