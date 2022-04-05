import { Roll, RollResult, RollSet, System } from '../types';
import { DiceParser } from '../ports/dice-parser';
import { ColorResolvable } from 'discord.js';

export class GenericSystem implements System {
	name = 'Generyczny';
	syntax = 'generic';

	constructor(public diceParser: DiceParser) {
	}

	parseFormulaAndRoll(formula: string): RollResult {
		return this.diceParser.parse(formula, {
			system: this,
		});
	}

	handleDieRoll(dieValueRange: number): number {
		return Math.floor((dieValueRange * Math.random()) + 1);
	}

	protected handleDiceRoll(throws: number | null, dieChar: string, dieValueRange: number, rootRollSets: RollSet[], range: [number, number]): number {
		throws = throws || 1;
		let sum = 0;
		let rolls: Roll[] = [];
		let throwResult, throwRolls: Roll[], firstRoll;

		for (let i = 0; i < throws; ++i) {
			throwResult = firstRoll = this.handleDieRoll(dieValueRange);
			throwRolls = [{
				value: firstRoll,
				flags: null
			}];

			sum += throwResult;
			rolls = rolls.concat(throwRolls);
		}

		rootRollSets.push({
			flags: null,
			range,
			rolls,
			dieChar,
			sum
		});

		return sum;
	}

	protected handleRollRootResults(value: number, rollSets: RollSet[]): RollResult {
		return {
			sum: Math.round(value),
			flags: null,
			rollCount: rollSets.reduce((sum, rollSet) => sum + rollSet.rolls.length, 0),
			rollSets: rollSets
		};
	};

	protected getValueDisplay(value: number, flags: any): string {
		return value + '';
	};

	protected shouldShowRollFormulaWithDiceValuesDisplay(formula: string, rollResult: RollResult): boolean {
		return 1 < rollResult.rollCount && rollResult.rollCount !== rollResult.rollSets.length
	}

	getRollFormulaWithDiceValuesDisplay(formula: string, rollResult: RollResult): string {
		if (!this.shouldShowRollFormulaWithDiceValuesDisplay(formula, rollResult)) {
			return '';
		}

		let result = formula;

		for (let i = rollResult.rollSets.length - 1; 0 <= i; --i) {
			const rollSet = rollResult.rollSets[i];
			const rolls = rollSet.rolls.map(r => {
				return this.getValueDisplay(r.value, r.flags);
			});
			const diceRollsStr = '[' + rolls.join(', ') + ']';
			result = result.substr(0, rollSet.range[0]) + diceRollsStr + result.substr(rollSet.range[1], result.length);
		}

		return result;
	};

	protected getRollFormulaWithDiceSumDisplay(formula: string, rollResult: RollResult): string {
		let result = formula;

		for (let i = rollResult.rollSets.length - 1; 0 <= i; --i) {
			const rollSet = rollResult.rollSets[i];
			const diceRollsStr = this.getValueDisplay(rollSet.sum, rollSet.flags);
			result = result.substr(0, rollSet.range[0]) + diceRollsStr + result.substr(rollSet.range[1], result.length);
		}

		return result;
	};

	getRollResultDisplay(formula: string, rollResult: RollResult): string {
		const rollFormulaSums = this.getRollFormulaWithDiceSumDisplay(formula, rollResult)
		const sum = this.getValueDisplay(rollResult.sum, rollResult.flags);

		if (sum === rollFormulaSums || !rollResult.rollCount) {
			return `**${sum}**`;
		}
		else {
			return `${rollFormulaSums} = **${sum}**`;
		}
	};

	getRollResultColor(formula: string, rollResult: RollResult): ColorResolvable | null {
		return null;
	}
};
