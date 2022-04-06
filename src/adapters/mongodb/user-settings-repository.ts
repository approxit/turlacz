import { Collection, MongoClient } from 'mongodb';
import { UserSettingsRepository } from '../../ports/user-settings-repository';
import { UserSettings } from '../../models/user-settings';
import { TurlaczUser } from '../../types';

const USERS_COLLECTION_NAME = 'users';

export class MongoDbUserSettingsRepository implements UserSettingsRepository {
	constructor(private mongoClient: MongoClient) {
	}

	private withConnection = async (fn: (collection: Collection) => Promise<any>): Promise<any> => {
		this.mongoClient.connect();
		const collection = this.mongoClient.db().collection<UserSettings>(USERS_COLLECTION_NAME);
		try {
			return await fn(collection);
		}
		finally {
			this.mongoClient.close();
		}
	};

	getUserSettings = async (guildId: string, channelId: string, user: TurlaczUser): Promise<UserSettings | null> =>
		await this.withConnection(
			async collection =>
				await collection.findOne(
					{
						guildId,
						channelId,
						userId: user.id
					},
					{
						projection: {
							_id: 0
						}
					}
				)
		);

	updateUserSettings = async (
		guildId: string,
		channelId: string,
		user: TurlaczUser,
		userFieldsToUpdate: Partial<UserSettings>
	): Promise<void> => {
		await this.withConnection(
			async collection =>
				await collection.updateOne(
					{
						guildId,
						channelId,
						userId: user.id
					},
					{
						$set: userFieldsToUpdate
					},
					{
						upsert: true
					}
				)
		);
	};

	deleteUserSettings = async (guildId: string, channelId: string): Promise<void> => {
		await this.withConnection(
			async collection =>
				await collection.deleteOne({
					guildId,
					channelId
				})
		);
	};
}
