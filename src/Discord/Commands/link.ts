import { SlashCommandBuilder } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Scoresaber from '../../Controllers/scoresaber.js'
import Beatleader from '../../Controllers/beatleader.js'
import SmallEmbed from '../Handlers/SmallEmbed.js'

const prisma = new PrismaClient()

export default {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your account id to BeatSnipe')
        .addStringOption((option) =>
            option
                .setName('id')
                .setDescription('Your account ID')
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })

        const playerId = interaction.options.getString('id')
        const discordId = interaction.guild !== null ? interaction.member.id : interaction.user.id

        const linked = await prisma.player.count({
            where: {
                discordId: discordId
            }
        })

        if (!linked) {
            const isPlayerExistSS = await Scoresaber.getplayerInfo(playerId)
            if (!isPlayerExistSS) {
                await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered on Scoresaber"))
                return false
            }

            const isPlayerExistBL = await Beatleader.getplayerInfo(playerId)
            if (!isPlayerExistBL) {
                await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered on Beatleader"))
                return false
            }

            if (!isPlayerExistSS && !isPlayerExistBL) {
                await interaction.editReply(SmallEmbed("❌ ┃ Your account does not exist on any leaderboard"))
                return false
            }

            const addPlayer = await prisma.player.create({
                data: {
                    id: playerId,
                    discordId: interaction.member.id
                }
            })

            await interaction.editReply(SmallEmbed("✅ ┃ Your account have been linked !"))
        } else {
            await interaction.editReply(SmallEmbed("❌ ┃ Your account already linked !"))
        }
    }
}