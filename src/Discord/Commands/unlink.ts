import { SlashCommandBuilder } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Snipe from '../../Controllers/snipe'
import SmallEmbed from '../Handlers/SmallEmbed'

const prisma = new PrismaClient()

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
        const discordId = interaction.guild !== null ? interaction.member.id : interaction.user.id

        await interaction.editReply(SmallEmbed("<:loading:1158674816136659006> ┃ Your unlink in progress ..."))

        const snipes = await prisma.snipe.findMany({
            where: {
                sniper: {
                    discordId: discordId 
                }
            },
            select: {
                id: true
            }
        })
        
        for (const snipe of snipes) {
            await Snipe.remove(snipe.id)
        }

        await interaction.editReply(SmallEmbed("✅ ┃ Your account has been unlink and sniped/playlist players have been deleted"))
    }
}