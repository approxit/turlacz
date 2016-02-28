export interface Command {
	data: any;

	execute(...args: any[]): Promise<void>;
}

export interface Event {
	name: string;
	once?: boolean;

	execute(...args: any[]): Promise<void>;
}

export interface SystemRootResults {
	sum: any;
	flags: any;
}

export interface Roll {
	value: number;
	flags?: any;
}

export interface RollSet {
	range: [number, number];
	rolls: Roll[];
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
	diceExplosion: boolean;
	syntax: string;
	handleRootResults?: (value: number, rollSets: RollSet[]) => SystemRootResults;
}
