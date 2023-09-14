import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js'
import playlist from '../../Utils/playlist.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export default {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your account id to BeatSnipe')
        .addStringOption((option) =>
            option
                .setName('id')
                .setDescription('Your account ID')
                .setRequired(true),
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true })
        await interaction.editReply("This command is still under construction, try again later.")
    }
}