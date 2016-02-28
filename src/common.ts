import { ChannelSettingsRepository } from './ports/channel-settings-repository';

export class CommandError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export async function getChannelSystemOrThrow(
	channelRepository: ChannelSettingsRepository,
	guildId: string,
	channelId: string
): Promise<string> {
	const channel = await channelRepository.getChannelSettings(guildId, channelId);

	if (!channel?.system) {
		console.log(`No session prepared for channel ${channelId}!`);

		throw new CommandError(`Aby użyć tej komendy musisz przygotować ten kanał za pomocą komendy \`/sesja\`!`);
	}

	return channel.system;
}
