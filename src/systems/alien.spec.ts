import assert from 'assert';
import { AlienSystem } from './alien';
import { runCommonMathTests } from './common.spec.js';
import PegJsDiceParser from '../adapters/pegjs/dice-parser.cjs';

describe('Alien system', () => {
	runCommonMathTests(AlienSystem);

	['n', 'n+s', 'N', 'N+S', '2n', '2n+2s'].map(args => {
		it(`should parse "${args}" without errors`, () => {
			const system = new AlienSystem(PegJsDiceParser);
			system.parseFormulaAndRoll(args);
		});
	});

	[
		's',
		'2s',
		'32+4s',
		's+s+s'
	].map(syntax => {
		it(`should fail on "${syntax}" stress only dice`, () => {
			const system = new AlienSystem(PegJsDiceParser);
			assert.throws(() => {
				system.parseFormulaAndRoll(syntax);
			}, Error);
		});
	});

	[
		{
			syntax: '5n',
			mockedRolls: [1, 2, 3, 4, 5],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: null },
						{ value: 2, flags: null },
						{ value: 3, flags: null },
						{ value: 4, flags: null },
						{ value: 5, flags: null }
					],
					flags: null,
				}
			],
			flags: null,
			result: 0
		},
		{
			syntax: 'n',
			mockedRolls: [6],
			rollSets: [
				{
					rolls: [
						{ value: 6, flags: true }
					],
					flags: true
				}
			],
			flags: true,
			result: 1
		},
		{
			syntax: '3n',
			mockedRolls: [6, 1, 6],
			rollSets: [
				{
					rolls: [
						{ value: 6, flags: true },
						{ value: 1, flags: null },
						{ value: 6, flags: true }
					],
					flags: true
				}
			],
			flags: true,
			result: 2
		}
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked states of normal dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const system = new AlienSystem(PegJsDiceParser);
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

	[
		{
			syntax: 'n+5s',
			mockedRolls: [2, 6, 5, 4, 3, 2],
			rollSets: [
				{
					rolls: [
						{ value: 2, flags: null }
					],
					flags: null
				},
				{
					rolls: [
						{ value: 6, flags: null },
						{ value: 5, flags: null },
						{ value: 4, flags: null },
						{ value: 3, flags: null },
						{ value: 2, flags: null }
					],
					flags: null
				}
			],
			result: 0,
			flags: null
		},
		{
			syntax: 'n+2s',
			mockedRolls: [1, 1, 1],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: null }
					],
					flags: null
				},
				{
					rolls: [
						{ value: 1, flags: false },
						{ value: 1, flags: false }
					],
					flags: false
				}
			],
			result: -1,
			flags: false
		},
		{
			syntax: '2n+s',
			mockedRolls: [6, 1, 1],
			rollSets: [
				{
					rolls: [
						{ value: 6, flags: true },
						{ value: 1, flags: null }
					],
					flags: true
				},
				{
					rolls: [
						{ value: 1, flags: false }
					],
					flags: false
				}
			],
			result: -1,
			flags: false
		},
		{
			syntax: '2n+s',
			mockedRolls: [6, 6, 1],
			rollSets: [
				{
					rolls: [
						{ value: 6, flags: true },
						{ value: 6, flags: true }

					],
					flags: true
				},
				{
					rolls: [
						{ value: 1, flags: false }
					],
					flags: false
				}
			],
			result: -1,
			flags: false
		}
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked states of stress dice "${test.mockedRolls}" as "${test.result}"`, () => {
			const system = new AlienSystem(PegJsDiceParser);
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

	[
		{
			syntax: '2n+s',
			mockedRolls: [3, 4, 1],
			rollSets: [
				{
					rolls: [
						{ value: 3, flags: null },
						{ value: 4, flags: null }
					],
					flags: null
				},
				{
					rolls: [
						{ value: 1, flags: false }
					],
					flags: false
				}
			]
		},
		{
			syntax: '2n+s',
			mockedRolls: [6, 6, 1],
			rollSets: [
				{
					rolls: [
						{ value: 6, flags: true },
						{ value: 6, flags: true }
					],
					flags: true
				},
				{
					rolls: [{ value: 1, flags: false }],
					flags: false
				}
			]
		},
		{
			syntax: 's+2n',
			mockedRolls: [1, 3, 4],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: false }
					],
					flags: false
				},
				{
					rolls: [
						{ value: 3, flags: null },
						{ value: 4, flags: null }
					],
					flags: null
				}
			]
		},
		{
			syntax: 's+2n',
			mockedRolls: [1, 6, 6],
			rollSets: [
				{
					rolls: [
						{ value: 1, flags: false }
					],
					flags: false
				},
				{
					rolls: [
						{ value: 6, flags: true },
						{ value: 6, flags: true }
					],
					flags: true
				}
			]
		}
	].map(test => {
		it(`should calculate "${test.syntax}" with mocked states of combined normal and stress dice "${test.mockedRolls}" as "-1"`, () => {
			const system = new AlienSystem(PegJsDiceParser);
			system.handleDieRoll = () => {
				return Number(test.mockedRolls.shift());
			};
			const result = system.parseFormulaAndRoll(test.syntax);

			assert.equal(result.sum, -1);
			assert.equal(result.flags, false);
			assert.deepStrictEqual(
				result.rollSets.map(s => ({ rolls: s.rolls, flags: s.flags })),
				test.rollSets
			);
		});
	});
});
