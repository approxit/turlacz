export interface UserDiceOptions {
	formula: string;
	comment?: string;
}

export interface UserSettings {
	nick?: string;
	image?: string;
	lastDiceOptions?: UserDiceOptions;
}
