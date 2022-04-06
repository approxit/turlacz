import assert from 'assert';
import PegJsDiceParser from '../adapters/pegjs/dice-parser.cjs';
import { TalSystem } from './tal';
import { runCommonMathTests } from './common.spec';
import { runGenericDiceSyntaxTests } from './generic.spec';

describe('TaL system', () => {
	runCommonMathTests(TalSystem);
	runGenericDiceSyntaxTests(TalSystem);

	const basicFormulas = ['k2', 'd2', 'K4', 'D6', 'k8', 'k10', 'k12', 'k20', '1k20', '20k20', '1 + 2 * (k2 - 1) / 2'];

	basicFormulas.map(args => {
		it(`should parse "${args}" without errors`, () => {
			const system = new TalSystem(PegJsDiceParser);
			system.parseFormulaAndRoll(args);
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
		{ syntax: 'k100', mockedRolls: [100], rollSets: [[100]], result: 100 }
	].map(test => {
		it(`should not reroll crits and calculate for "${test.syntax}" with mocked dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const system = new TalSystem(PegJsDiceParser);
			system.handleDieRoll = () => {
				return Number(test.mockedRolls.shift());
			};
			const result = system.parseFormulaAndRoll(test.syntax);

			assert.equal(result.sum, test.result);
			assert.equal(result.flags, null);
			assert.deepStrictEqual(
				result.rollSets.map(s => s.rolls.map(r => r.value)),
				test.rollSets
			);
			result.rollSets.forEach(rollSet => {
				assert.equal(rollSet.rolls.every(r => r.flags === null), true);
			});
		});
	});

	[
		{
			syntax: 'k20',
			mockedRolls: [1, 5],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: false },
						{ value: 5, flags: null }
					],
					flags: false
				}
			],
			flags: false,
			result: -5
		},
		{
			syntax: 'k20',
			mockedRolls: [20, 5],
			rollSets: [
				{
					rolls: [
						{ value: 20, flags: true },
						{ value: 5, flags: null }
					],
					flags: true
				}
			],
			flags: true,
			result: 25
		},
		{
			syntax: 'k20',
			mockedRolls: [1, 20, 5],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: false },
						{ value: 20, flags: false },
						{ value: 5, flags: null }
					],
					flags: false
				}
			],
			flags: false,
			result: -25
		},
		{
			syntax: 'k20',
			mockedRolls: [20, 20, 5],
			rollSets: [
				{
					rolls: [
						{ value: 20, flags: true },
						{ value: 20, flags: true },
						{ value: 5, flags: null }
					],
					flags: true
				}
			],
			flags: true,
			result: 45
		},
		{
			syntax: '3k20',
			mockedRolls: [2, 20, 20, 5, 1, 3],
			rollSets: [
				{
					rolls: [
						{ value: 2, flags: null },
						{ value: 20, flags: true },
						{ value: 20, flags: true },
						{ value: 5, flags: null },
						{ value: 1, flags: false },
						{ value: 3, flags: null }
					],
					flags: false
				}
			],
			flags: false,
			result: 44
		},
		{
			syntax: '3k20',
			mockedRolls: [1, 3, 2, 20, 20, 5],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: false },
						{ value: 3, flags: null },
						{ value: 2, flags: null },
						{ value: 20, flags: true },
						{ value: 20, flags: true },
						{ value: 5, flags: null }
					],
					flags: false
				}
			],
			flags: false,
			result: 44
		}
	].map(test => {
		it(`should reroll crits and calculate for "${test.syntax}" with mocked dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const system = new TalSystem(PegJsDiceParser);
			system.handleDieRoll = () => {
				return Number(test.mockedRolls.shift());
			};
			const result = system.parseFormulaAndRoll(test.syntax);

			assert.equal(result.sum, test.result);
			assert.equal(result.flags, test.flags);
			assert.deepStrictEqual(
				result.rollSets.map(s => ({ rolls: s.rolls, flags: s.flags })),
				test.rollSets
			);
		});
	});
});
