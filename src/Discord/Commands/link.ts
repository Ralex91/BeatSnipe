import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Scoresaber from '../../Controllers/scoresaber.js';
import Beatleader from '../../Controllers/beatleader.js';
import SmallEmbed from '../Handlers/SmallEmbed.js';

const prisma = new PrismaClient();

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

        let playerId = interaction.options.getString('id')
        let discordId = interaction.guild !== null ? interaction.member.id : interaction.user.id

        let isExist = await prisma.player.count({
            where: {
                discordId: discordId
            }
        })

        if (!isExist) {
            let isPlayerExistSS = await Scoresaber.getplayerInfo(playerId)
            if (!isPlayerExistSS) {
                await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered on Scoresaber"))
                return false
            }

            let isPlayerExistBL = await Beatleader.getplayerInfo(playerId)
            if (!isPlayerExistBL) {
                await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered on Beatleader"))
                return false
            }

            if (!isPlayerExistSS && !isPlayerExistBL) {
                await interaction.editReply(SmallEmbed("❌ ┃ Your account does not exist on any leaderboard"))
                return false
            }

            let addPlayer = await prisma.player.create({
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