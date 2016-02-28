const assert = require('assert');
const dice = require('../../../src/dice');
const peg$SyntaxError = require('pegjs').peg$SyntaxError;
const system = require('../../../src/systems/generic');

describe('Generic system', () => {
	const basicFormulas = ['k2', 'd2', 'K4', 'D6', 'k8', 'k10', 'k12', 'k20', '1k20', '20k20', '1 + 2 * (k2 - 1) / 2'];

	basicFormulas.map(args => {
		it(`should not parse "${args}" without explicit system name`, () => {
			assert.throws(() => {
				dice.parse(args);
			}, peg$SyntaxError);
		});
	});

	basicFormulas.map(args => {
		it(`should parse "${args}" without errors`, () => {
			dice.parse(args, {
				system: system,
			});
		});
	});

	[
		{ syntax: 'k2', mockedRolls: [5], rollSets: [[5]], result: 5 },
		{ syntax: 'k20', mockedRolls: [20, 2], rollSets: [[20, 2]], result: 22 },
		{ syntax: 'k20', mockedRolls: [20, 20, 20, 4], rollSets: [[20, 20, 20, 4]], result: 64 },
		{ syntax: 'k20', mockedRolls: [20, 1], rollSets: [[20, 1]], result: 21 },
		{ syntax: 'k20', mockedRolls: [1, 1], rollSets: [[1, 1]], result: -1 },
		{ syntax: 'k20', mockedRolls: [1, 10], rollSets: [[1, 10]], result: -10 },
		{ syntax: 'k20', mockedRolls: [1, 20, 10], rollSets: [[1, 20, 10]], result: -30 },
		{ syntax: '2k20', mockedRolls: [3, 1, 20, 10], rollSets: [[3, 1, 20, 10]], result: -27 },
		{ syntax: '2k20', mockedRolls: [20, 2, 4], rollSets: [[20, 2, 4]], result: 26 },
		{ syntax: '1k20+k2', mockedRolls: [1, 5, 2], rollSets: [[1, 5], [2]], result: -3 },
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked explosive dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = dice.parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				diceExplosion: true,
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
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked critical states of explosive dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = dice.parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				diceExplosion: true,
				system: system,
			});

			assert.equal(result.sum, test.result);
			assert.deepStrictEqual(
				result.rollSets.map(s => s.rolls),
				test.rollSets
			);
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
		it(`should not reroll crits and calculate for "${test.syntax}" with mocked explosive dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = dice.parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				diceExplosion: true,
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
		{ syntax: 'k20', mockedRolls: [1], rollSets: [[{ value: 1, flags: false }]], result: 1 },
		{ syntax: 'k20', mockedRolls: [20], rollSets: [[{ value: 20, flags: true }]], result: 20 },
	].map(test => {
		it(`should not reroll crits and calculate for "${test.syntax}" with mocked non explosive dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = dice.parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				diceExplosion: false,
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
