import { DiceParser } from './ports/dice-parser';
import { ColorResolvable } from 'discord.js';

export interface Command {
	data: any;

	execute(...args: any[]): Promise<void>;
}

export interface Event {
	name: string;
	once?: boolean;

	execute(...args: any[]): Promise<void>;
}

export interface Roll {
	value: number;
	flags?: any;
}

export interface RollSet {
	range: [number, number];
	rolls: Roll[];
	dieChar: string;
	flags?: any;
	sum: number;
}

export interface RollResult {
	rollCount: number;
	rollSets: RollSet[];
	flags?: any;
	sum: number;
}

export interface System {
	name: string;
	syntax: string;

	parseFormulaAndRoll(formula: string, mockedDieThrows?: number[]): RollResult;

	getRollFormulaWithDiceValuesDisplay(formula: string, rollResult: RollResult): string;
	getRollResultDisplay(formula: string, rollResult: RollResult): string;
	getRollResultColor(formula: string, rollResult: RollResult): ColorResolvable | null;
	getRollResultColor(formula: string, rollResult: RollResult): ColorResolvable | null;
}

export interface SystemConstructor {
	new (diceParser: DiceParser): System;
}