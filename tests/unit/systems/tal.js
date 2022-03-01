import assert from 'assert';
import { parse, SyntaxError } from '../../../dist/adapters/pegjs/dice.cjs';
import { tal as system } from '../../../dist/systems/tal.js';
import { runCommonMathTests } from './common.js';
import { runGenericDiceSyntaxTests } from './generic.js';

describe('TaL system', () => {
	const options = {
		system: system,
	};
	runCommonMathTests(options);
	runGenericDiceSyntaxTests(options);

	const basicFormulas = ['k2', 'd2', 'K4', 'D6', 'k8', 'k10', 'k12', 'k20', '1k20', '20k20', '1 + 2 * (k2 - 1) / 2'];

	basicFormulas.map(args => {
		it(`should not parse "${args}" without explicit system name`, () => {
			assert.throws(() => {
				parse(args);
			}, SyntaxError);
		});
	});

	basicFormulas.map(args => {
		it(`should parse "${args}" without errors`, () => {
			parse(args, {
				system: system,
			});
		});
	});

	[
		{ syntax: 'k2', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k2', mockedRolls: [2], rollSets: [[2]], result: 2 },
		{ syntax: 'k4', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k4', mockedRolls: [4], rollSets: [[4]], result: 4 },
		{ syntax: 'k6', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k6', mockedRolls: [6], rollSets: [[6]], result: 6 },
		{ syntax: 'k8', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k8', mockedRolls: [8], rollSets: [[8]], result: 8 },
		{ syntax: 'k10', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k10', mockedRolls: [10], rollSets: [[10]], result: 10 },
		{ syntax: 'k12', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k12', mockedRolls: [12], rollSets: [[12]], result: 12 },
		{ syntax: 'k100', mockedRolls: [1], rollSets: [[1]], result: 1 },
		{ syntax: 'k100', mockedRolls: [100], rollSets: [[100]], result: 100 },
	].map(test => {
		it(`should not reroll crits and calculate for "${test.syntax}" with mocked dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				system: system,
			});

			assert.equal(result.sum, test.result);
			assert.deepStrictEqual(
				result.rollSets.map(s => s.rolls.map(r => r.value)),
				test.rollSets
			);
		});
	});

	[
		{
			syntax: 'k20',
			mockedRolls: [1, 5],
			rollSets: [
				[
					{ value: 1, flags: false },
					{ value: 5, flags: null },
				],
			],
			result: -5,
		},
		{
			syntax: 'k20',
			mockedRolls: [20, 5],
			rollSets: [
				[
					{ value: 20, flags: true },
					{ value: 5, flags: null },
				],
			],
			result: 25,
		},
		{
			syntax: 'k20',
			mockedRolls: [1, 20, 5],
			rollSets: [
				[
					{ value: 1, flags: false },
					{ value: 20, flags: false },
					{ value: 5, flags: null },
				],
			],
			result: -25,
		},
		{
			syntax: 'k20',
			mockedRolls: [20, 20, 5],
			rollSets: [
				[
					{ value: 20, flags: true },
					{ value: 20, flags: true },
					{ value: 5, flags: null },
				],
			],
			result: 45,
		},
		{
			syntax: '3k20',
			mockedRolls: [2, 20, 20, 5, 1, 3],
			rollSets: [
				[
					{ value: 2, flags: null },
					{ value: 20, flags: true },
					{ value: 20, flags: true },
					{ value: 5, flags: null },
					{ value: 1, flags: false },
					{ value: 3, flags: null },
				],
			],
			result: 44,
		},
	].map(test => {
		it(`should reroll crits and calculate for "${test.syntax}" with mocked dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				system: system,
			});

			assert.equal(result.sum, test.result);
			assert.deepStrictEqual(
				result.rollSets.map(s => s.rolls),
				test.rollSets
			);
		});
	});
});