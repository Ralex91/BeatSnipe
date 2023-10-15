import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Snipe from '../../Controllers/snipe'
import SmallEmbed from '../Handlers/SmallEmbed'

const prisma = new PrismaClient()

export default {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your account id to BeatSnipe'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const discordId = interaction.user.id

        await interaction.editReply(SmallEmbed("<a:loading:1158674816136659006> ┃ Your unlink in progress ..."))

        const player = await prisma.player.findUnique({
            where: {
                discordId: discordId
            }
        })

        if (!player) {
            await interaction.editReply(SmallEmbed("❌ ┃ No account link! Link your account with </link:1151622228639760465>"))
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

        await interaction.editReply(SmallEmbed("✅ ┃ Your account has been unlink and sniped/playlist players have been deleted"))
    }
}