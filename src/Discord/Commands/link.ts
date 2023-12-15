import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
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
            return
        }

        const playerDataSS = await Scoresaber.getplayerInfo(playerId)
        const playerDataBL = await Beatleader.getplayerInfo(playerId)
        const playerData = playerDataSS ? playerDataSS : playerDataBL

        if (!playerData) {
            await interaction.editReply(SmallEmbed("❌ ┃ Your account does not exist on any leaderboard"))
            return
        }

        const addPlayer = await prisma.player.create({
            data: {
                id: playerId,
                discordId: discordId
            }
        })

        const linkedEmbed = new EmbedBuilder()
            .setColor('#4cd639')
            .setTitle(playerData.name)
            .setURL(playerData.url)
            .setThumbnail(playerData.avatar)
            .setDescription(`Your account has been linked to your Discord account !\nRun </snipe add:1151622228639760468> command to add a player to snipe`)

        await interaction.editReply({ embeds: [linkedEmbed] })
    }
}