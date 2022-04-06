import { UserSettings } from '../models/user-settings';
import { TurlaczUser } from '../types';

export interface UserSettingsRepository {
	getUserSettings: (guildId: string, channelId: string, user: TurlaczUser) => Promise<UserSettings | null>;
	updateUserSettings: (
		guildId: string,
		channelId: string,
		user: TurlaczUser,
		userFieldsToUpdate: Partial<UserSettings>
	) => Promise<void>;
	deleteUserSettings: (guildId: string, channelId: string, user: TurlaczUser) => Promise<void>;
}
