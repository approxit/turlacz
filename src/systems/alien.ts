import { RollResult, RollSet } from '../types';
import { GenericSystem } from './generic';
import { ColorResolvable } from 'discord.js';

const CRITICAL_UP_MARK = ':star:';
const CRITICAL_UP_COLOR = 'ORANGE';
const CRITICAL_DOWN_MARK = ':boom:';
const CRITICAL_DOWN_COLOR = 'RED';

export class AlienSystem extends GenericSystem {
	name = 'Alien RPG';
	syntax = 'alien';

	protected handleDiceRoll(throws: number | null, dieChar: string, dieValueRange: number, rootRollSets: RollSet[], range: [number, number]): number {
		throws = throws || 1;
		let sum = 0;
		let rollResult: number;
		const rolls = [];
		let rollsFlags = null;

		for (let i = 0; i < throws; ++i) {
			rollResult = this.handleDieRoll(6);
			let flags = null;
			if (dieChar === 'n' && rollResult === 6) {
				flags = true;
				if (rollsFlags !== false) {
					rollsFlags = true;
				}
			}

			if (dieChar === 's' && rollResult === 1) {
				flags = rollsFlags = false;
			}

			rolls.push({
				value: rollResult,
				flags: flags
			});

			if (dieChar === 'n') {
				sum += rollResult == 6 ? 1 : 0;
			}
		}

		const rollsSum = rollsFlags === false ? -1 : sum;

		rootRollSets.push({
			flags: rollsFlags,
			sum: rollsSum,
			range,
			rolls,
			dieChar,
		});

		return rollsSum;
	}

	protected handleRollRootResults(value: number, rollSets: RollSet[]): RollResult {
		const hasOnlyStressDice = rollSets.length && rollSets.every(r => r.dieChar === 's');
		if (hasOnlyStressDice) {
			throw new Error('Rzuty samymi koścmi stresu są niedowzolone!');
		}

		const rollResult = super.handleRollRootResults(value, rollSets);

		const hasAnyFailFlags = rollSets.some(r => r.flags === false);
		const hasAnySuccessFlags = rollSets.some(r => r.flags === true);

		return {
			...rollResult,
			sum: hasAnyFailFlags ? -1 : Math.round(value),
			flags: hasAnyFailFlags ? false : hasAnySuccessFlags ? true : null
		};
	};

	protected getValueDisplay(value: number, flags: any): string {
		if (flags !== null) {
			return value + (flags ? CRITICAL_UP_MARK : CRITICAL_DOWN_MARK);
		}
		else {
			return value + '';
		}
	};

	protected shouldShowRollFormulaWithDiceValuesDisplay(formula: string, rollResult: RollResult): boolean {
		return true;
	}

	getRollResultDisplay(formula: string, rollResult: RollResult): string {
		if (rollResult.sum < 0) {
			return 'Wpadka!';
		}
		else if (rollResult.sum === 0) {
			return 'Porażka';
		}
		else if (rollResult.sum === 1) {
			return 'Sukces';
		}
		else {
			return 'Wyczyn!';
		}
	}

	getRollResultColor(formula: string, rollResult: RollResult): ColorResolvable | null {
		if (1 < rollResult.sum) {
			return CRITICAL_UP_COLOR;
		}
		if (rollResult.flags === false) {
			return CRITICAL_DOWN_COLOR;
		}

		return super.getRollResultColor(formula, rollResult);
	}
};
