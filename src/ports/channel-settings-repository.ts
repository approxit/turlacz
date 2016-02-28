import { ChannelSettings } from '../models/channel-settings';

export interface ChannelSettingsRepository {
	getChannelSettings: (guildId: string, channelId: string) => Promise<ChannelSettings | null>;
	updateChannelSettings: (
		guildId: string,
		channelId: string,
		channelFieldToUpdate: Partial<ChannelSettings>
	) => Promise<void>;
	deleteChannelSettings: (guildId: string, channelId: string) => Promise<void>;
}
