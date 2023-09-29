import { SlashCommandBuilder } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Beatleader from '../../Controllers/beatleader'
import Scoresaber from '../../Controllers/scoresaber'
import SmallEmbed from '../Handlers/SmallEmbed'

const prisma = new PrismaClient()

export default {
    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Show your snipe list'),

    async execute(interaction) {
        const discordId = interaction.guild !== null ? interaction.member.id : interaction.user.id
        await interaction.deferReply({ ephemeral: true })

        const getSniperId = await prisma.player.findFirst({
            where: {
                discordId: discordId
            },
            select: {
                id: true
            }
        })

        if (!getSniperId) {
            await interaction.editReply(SmallEmbed("❌ ┃ No account link! Link your account with </link:1151622228639760465>"))
            return false
        }

        const getAllSnipe = await prisma.snipe.findMany({
            where: {
                sniperId: getSniperId.id

            },
            select: {
                playerId: true,
                leaderboard: true
            }
        })

        if (!getAllSnipe) {
            await interaction.editReply(SmallEmbed("❌ ┃ Your snipe list is empty"))
            return false
        }

        const snipeListEmbed = {
            color: 0xff0000,
            title: "📋 ┃ List of players you are sniping",
            thumbnail: {
                url: 'https://cdn-icons-png.flaticon.com/512/5641/5641195.png',
            },
            fields: [],
            footer: {
                text: `BeatSnipe v${process.env.DISPLAY_VERSION}`,
                icon_url: client.user.displayAvatarURL(),
            },
        };

        for (const player of getAllSnipe) {
            let playerInfo: playerInfo | false

            if (player.leaderboard.includes("scoresaber")) {
                playerInfo = await Scoresaber.getplayerInfo(player.playerId)
            } else if (player.leaderboard.includes("beatleader")) {
                playerInfo = await Beatleader.getplayerInfo(player.playerId)
            }

            if (playerInfo) {
                snipeListEmbed.fields.push({ name: `👤 ┃ ${playerInfo.name}`, value: "🔹 `" + player.playerId + "`" })
            } else {
                console.log(`Player not found on API: ${player.playerId}`)
            }
        }

        await interaction.editReply({ embeds: [snipeListEmbed] })
    }
}