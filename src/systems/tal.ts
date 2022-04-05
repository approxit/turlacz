import { GenericSystem } from './generic';
import { Roll, RollResult, RollSet } from '../types';
import { ColorResolvable } from 'discord.js';

const CRITICAL_UP_MARK = ':star:';
const CRITICAL_UP_COLOR = 'ORANGE';
const CRITICAL_DOWN_MARK = ':boom:';
const CRITICAL_DOWN_COLOR = 'RED';

export class TalSystem extends GenericSystem {
	name = 'Tales and Legends';

	protected handleDiceRoll(throws: number | null, dieChar: string, dieValueRange: number, rootRollSets: RollSet[], range: [number, number]): number {
		throws = throws || 1;
		let sum = 0;
		let rolls: Roll[] = [];
		let rollsFlags = null;
		let throwResult, throwRolls: Roll[], firstRoll, roll;

		for (let i = 0; i < throws; ++i) {
			throwResult = firstRoll = this.handleDieRoll(dieValueRange);
			throwRolls = [{
				value: firstRoll,
				flags: null
			}];

			if ((dieValueRange == 20) && ((firstRoll == 20) || (firstRoll == 1))) {
				throwRolls[0].flags = firstRoll == 20;
				if (rollsFlags !== false) {
					rollsFlags = throwRolls[0].flags;
				}

				do {
					roll = this.handleDieRoll(dieValueRange);
					throwRolls.push({
						value: roll,
						flags: null
					});
					throwResult += roll;
				}
				while (roll == 20);

				if (firstRoll === 1) {
					throwResult = firstRoll - throwResult;
				}

				for (let j = 0; j < throwRolls.length - 1; ++j) {
					throwRolls[j].flags = firstRoll == 20;
				}
			}

			sum += throwResult;
			rolls = rolls.concat(throwRolls);
		}

		rootRollSets.push({
			flags: rollsFlags,
			dieChar,
			range,
			rolls,
			sum
		});

		return sum;
	}

	protected handleRollRootResults(value: number, rollSets: RollSet[]): RollResult {
		const rollResult = super.handleRollRootResults(value, rollSets);

		const hasAnyFailFlags = rollSets.some(r => r.flags === false);
		const hasAnySuccessFlags = rollSets.some(r => r.flags === true);

		return {
			...rollResult,
			sum: Math.round(value),
			flags: hasAnyFailFlags ? false : hasAnySuccessFlags ? true : null
		};
	}

	protected getValueDisplay(value: number, flags: any): string {
		if (flags !== null) {
			return value + (flags ? CRITICAL_UP_MARK : CRITICAL_DOWN_MARK);
		}
		else {
			return value + '';
		}
	};

	getRollResultColor(formula: string, rollResult: RollResult): ColorResolvable | null {
		if (rollResult.flags !== null) {
			return rollResult.flags ? CRITICAL_UP_COLOR : CRITICAL_DOWN_COLOR
		}

		return super.getRollResultColor(formula, rollResult);
	}
};
