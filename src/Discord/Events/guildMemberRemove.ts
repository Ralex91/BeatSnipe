import { GuildMember } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Snipe from '../../Controllers/snipe'

const prisma = new PrismaClient()

export default class guildMemberRemove {
	private static member: GuildMember

	static async execute(member: GuildMember) {
		this.member = member

		const discordId = member.id

		const player = await prisma.player.findUnique({
			where: {
				discordId: discordId
			}
		})

		if (!player) {
			return
		}

		const snipes = await prisma.snipe.findMany({
			where: {
				sniper: {
					discordId: discordId
				}
			},
			select: {
				id: true,
			}
		})

		if (snipes) {
			for (const snipe of snipes) {
				await Snipe.remove(snipe.id)
			}
		}

		const deleteLink = await prisma.player.delete({
			where: {
				discordId: discordId
			}
		})
	}
}