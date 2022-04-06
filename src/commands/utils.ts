import { Interaction } from 'discord.js';
import { TurlaczUser } from '../types';

export function getTurlaczUser(interaction: Interaction<'cached'>): TurlaczUser {
	const z: any = interaction.member; // FIXME: WHY discord.js can work by default with this?!?!
	return {
		id: interaction.user.id,
		displayName: z.nick ?? interaction.member.user.username,
		displayAvatar: interaction.user.displayAvatarURL({ dynamic: true })
	};
}