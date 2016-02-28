import { System } from '../types';

export const alien: System = {
	name: 'Alien RPG',
	diceExplosion: false,
	syntax: 'alien',
	handleRootResults(value, rollSets) {
		const hasAnyFailFlags = rollSets.some(r => r.flags === false);
		const hasAnySuccessFlags = rollSets.some(r => r.flags === true);

		return {
			sum: hasAnyFailFlags ? -1 : Math.round(value),
			flags: hasAnyFailFlags ? false : hasAnySuccessFlags ? true : null,
		};
	},
};
