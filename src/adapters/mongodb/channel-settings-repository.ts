import { ChannelSettingsRepository } from '../../ports/channel-settings-repository';
import { Collection, MongoClient } from 'mongodb';
import { ChannelSettings } from '../../models/channel-settings';

const CHANNELS_COLLECTION_NAME = 'channels';

export class MongoDbChannelSettingsRepository implements ChannelSettingsRepository {
	constructor(private mongoClient: MongoClient) {}

	private withConnection = async (fn: (collection: Collection) => Promise<any>): Promise<any> => {
		await this.mongoClient.connect();
		const collection = this.mongoClient.db().collection<ChannelSettings>(CHANNELS_COLLECTION_NAME);
		try {
			return await fn(collection);
		} finally {
			await this.mongoClient.close();
		}
	};

	public getChannelSettings = async (guildId: string, channelId: string): Promise<ChannelSettings | null> =>
		await this.withConnection(
			async collection =>
				await collection.findOne(
					{
						guildId,
						channelId,
					},
					{
						projection: {
							_id: 0,
						},
					}
				)
		);

	public updateChannelSettings = async (
		guildId: string,
		channelId: string,
		channelFieldToUpdate: Partial<ChannelSettings>
	): Promise<void> => {
		await this.withConnection(async connection => {
			await connection.updateOne(
				{
					guildId,
					channelId,
				},
				{
					$set: channelFieldToUpdate,
				},
				{
					upsert: true,
				}
			);
		});
	};

	public deleteChannelSettings = async (guildId: string, channelId: string): Promise<void> => {
		await this.withConnection(
			async collection =>
				await collection.deleteOne({
					guildId,
					channelId,
				})
		);
	};
}
