import { User } from 'discord.js';
import { UserSettings } from '../models/user-settings';

export interface UserSettingsRepository {
	getUserSettings: (guildId: string, channelId: string, user: User) => Promise<UserSettings | null>;
	updateUserSettings: (
		guildId: string,
		channelId: string,
		user: User,
		userFieldsToUpdate: Partial<UserSettings>
	) => Promise<void>;
	deleteUserSettings: (guildId: string, channelId: string, user: User) => Promise<void>;
}
