import { RollResult } from '../types';

export interface DiceParser {
	parse: (formula: string, options: any) => RollResult;
}