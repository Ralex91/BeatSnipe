import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
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

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })

        const playerId = interaction.options.getString('id')
        const discordId = interaction.user.id

        if (!playerId) {
            await interaction.editReply(SmallEmbed("❌ ┃ Player ID is require"))
            return
        }

        const linked = await prisma.player.count({
            where: {
                discordId: discordId
            }
        })

        if (linked) {
            await interaction.editReply(SmallEmbed("❌ ┃ Your account already linked !"))
        }
        const isPlayerExistSS = await Scoresaber.getplayerInfo(playerId)
        const isPlayerExistBL = await Beatleader.getplayerInfo(playerId)

        if (!isPlayerExistSS && !isPlayerExistBL) {
            await interaction.editReply(SmallEmbed("❌ ┃ Your account does not exist on any leaderboard"))
            return false
        }

        const addPlayer = await prisma.player.create({
            data: {
                id: playerId,
                discordId: discordId
            }
        })

        await interaction.editReply(SmallEmbed("✅ ┃ Your account have been linked !"))
    }
}