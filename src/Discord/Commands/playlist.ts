import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js'
import playlist from '../../Utils/playlist.js'
import { PrismaClient } from '@prisma/client'
import SmallEmbed from '../Handlers/SmallEmbed.js'
import Scoresaber from '../../Controllers/scoresaber.js'
import Beatleader from '../../Controllers/beatleader.js'

const prisma = new PrismaClient()
const cooldown = new Set()

export default {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Generate a snipe playlist')
        .addStringOption((option) =>
            option
                .setName('player')
                .setDescription('Player ID')
                .setRequired(true),
        )
        .addStringOption((option) =>
            option
                .setName('leaderboard')
                .setDescription('Leaderboard scores')
                .addChoices(
                    { name: 'Scoresaber', value: 'scoresaber' },
                    { name: 'Beatleader', value: 'beatleader' },
                )
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })

        const playerId = interaction.options.getString('player')
        const discordId = interaction.guild !== null ? interaction.member.id : interaction.user.id
        const leaderboard = interaction.options.getString('leaderboard')

        if (cooldown.has(discordId)) {
            await interaction.editReply(SmallEmbed("⏱ ┃ You have to wait 20 seconde before you can use the playlist commands again"))
            return false
        }

        const snipe = await prisma.snipe.findFirst({
            where: {
                playerId: playerId,
                sniper: {
                    discordId: discordId
                }
            },
            select: {
                id: true,
                leaderboard: true
            }
        })

        cooldown.add(interaction.member.id)
        setTimeout(function () {
            cooldown.delete(discordId)
        }, 20000)

        if (!snipe) {
            await interaction.editReply(SmallEmbed("❌ ┃ Snipe not found"))
            return false
        }

        if (!snipe.leaderboard.split(",").includes(leaderboard)) {
            interaction.editReply(SmallEmbed("❌ ┃ The snipe is not active on this leaderboard"))
            return false
        }

        let playerInfo: playerInfo | false
        if (leaderboard === "scoresaber") {
            playerInfo = await Scoresaber.getplayerInfo(playerId)
        }

        if (leaderboard === "beatleader") {
            playerInfo = await Beatleader.getplayerInfo(playerId)
        }

        if (!playerInfo) {
            await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered in this leaderboard"))
            return false
        }

        await interaction.editReply(SmallEmbed("<:loading:1158674816136659006> ┃ Playlist generation in progress..."))

        const playlistContent = await playlist(leaderboard, snipe.id)
        const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(playlistContent)), { name: playerInfo.name + '_Snipe_playlist_' + leaderboard + '.bplist' })

        await interaction.editReply({ embeds: [{ color: 0xff0000, title: `✅ ┃ Snipe's playlist is ready` }], files: [attachment] })
    }
}