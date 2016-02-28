const assert = require('assert');
const dice = require('../../../src/dice');
const peg$SyntaxError = require('pegjs').peg$SyntaxError;
const system = require('../../../src/systems/alien');

describe('Alien system', () => {
	const basicFormulas = ['n', 's', 'N', 'S', '2s', '2n'];

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
		{
			syntax: '5n',
			mockedRolls: [1, 2, 3, 4, 5],
			rollSets: [
				[
					{ value: 1, flags: null },
					{ value: 2, flags: null },
					{ value: 3, flags: null },
					{ value: 4, flags: null },
					{ value: 5, flags: null },
				],
			],
			result: 0,
		},
		{ syntax: 'n', mockedRolls: [6], rollSets: [[{ value: 6, flags: true }]], result: 1 },
		{
			syntax: '3n',
			mockedRolls: [6, 1, 6],
			rollSets: [
				[
					{ value: 6, flags: true },
					{ value: 1, flags: null },
					{ value: 6, flags: true },
				],
			],
			result: 2,
		},
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked states of normal dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = dice.parse(test.syntax, {
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

	[
		{
			syntax: '5s',
			mockedRolls: [6, 5, 4, 3, 2],
			rollSets: [
				[
					{ value: 6, flags: null },
					{ value: 5, flags: null },
					{ value: 4, flags: null },
					{ value: 3, flags: null },
					{ value: 2, flags: null },
				],
			],
			result: 0,
			flags: null,
		},
		{
			syntax: '2s',
			mockedRolls: [1, 1],
			rollSets: [
				[
					{ value: 1, flags: false },
					{ value: 1, flags: false },
				],
			],
			result: -1,
			flags: false,
		},
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked states of stress dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const result = dice.parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				system: system,
			});

			assert.equal(result.sum, test.result);
			assert.equal(result.flags, test.flags);
			assert.deepStrictEqual(
				result.rollSets.map(s => s.rolls),
				test.rollSets
			);
		});
	});

	[
		{
			syntax: '2n+s',
			mockedRolls: [3, 4, 1],
			rollSets: [
				[
					{ value: 3, flags: null },
					{ value: 4, flags: null },
				],
				[{ value: 1, flags: false }],
			],
		},
		{
			syntax: '2n+s',
			mockedRolls: [6, 6, 1],
			rollSets: [
				[
					{ value: 6, flags: true },
					{ value: 6, flags: true },
				],
				[{ value: 1, flags: false }],
			],
		},
		{
			syntax: 's+2n',
			mockedRolls: [1, 3, 4],
			rollSets: [
				[{ value: 1, flags: false }],
				[
					{ value: 3, flags: null },
					{ value: 4, flags: null },
				],
			],
		},
		{
			syntax: 's+2n',
			mockedRolls: [1, 6, 6],
			rollSets: [
				[{ value: 1, flags: false }],
				[
					{ value: 6, flags: true },
					{ value: 6, flags: true },
				],
			],
		},
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked states of combined normal and stress dice "${test.mockedRolls}" as "-1"`, () => {
			const result = dice.parse(test.syntax, {
				mockedRolls: test.mockedRolls,
				system: system,
			});

			assert.equal(result.sum, -1);
			assert.equal(result.flags, false);
			assert.deepStrictEqual(
				result.rollSets.map(s => s.rolls),
				test.rollSets
			);
		});
	});
});
