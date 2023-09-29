import { SlashCommandBuilder } from 'discord.js'
import { PrismaClient } from '@prisma/client'
import Snipe from '../../Controllers/snipe'
import Scoresaber from '../../Controllers/scoresaber'
import Beatleader from '../../Controllers/beatleader'
import SmallEmbed from '../Handlers/SmallEmbed'

const prisma = new PrismaClient()
const cooldownAdd = new Set()
const cooldownRemove = new Set()

export default {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Snipe command')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription("Add the player to your snipe list")
                .addStringOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Player ID')
                        .setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName('leaderboard')
                        .setDescription('Leaderboard(s) where the snipe will be active')
                        .addChoices(
                            { name: 'Scoresaber', value: 'scoresaber' },
                            { name: 'Beatleader', value: 'beatleader' },
                            { name: 'Scoresaber & Beatleader', value: 'scoresaber,beatleader' },
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription("Remove a player from your snipe list")
                .addStringOption((option) =>
                    option
                        .setName('player')
                        .setDescription('Player ID')
                        .setRequired(true),
                ),
        ),

    async execute(interaction) {
        const action = interaction.options.getSubcommand(true)
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

        const playerId = interaction.options.getString('player')
        const leaderboard = interaction.options.getString('leaderboard')

        const snipeInfo = await prisma.snipe.findFirst({
            where: {
                playerId: playerId,
                sniperId: getSniperId.id

            },
            select: {
                id: true
            }
        })

        switch (action) {
            case 'add': {

                if (cooldownAdd.has(discordId)) {
                    await interaction.editReply(SmallEmbed("⏱ ┃ You have to wait 1 minutes before you can use this command again"))
                    return false
                }

                if (playerId === discordId) {
                    await interaction.editReply(SmallEmbed("❌ ┃ You can't snipe yourself 🧠"))
                    return false
                }

                if (snipeInfo) {
                    await interaction.editReply(SmallEmbed("❌ ┃ You already have a snipe on this player"))
                    return false
                }

                let snipeCount = await prisma.snipe.count({
                    where: {
                        sniperId: getSniperId.id
                    }
                })

                if (snipeCount > 5) {
                    await interaction.editReply(SmallEmbed("❌ ┃ You have reached your snipe limit of 5 players at the same time"))
                    return false
                }

                if (leaderboard.includes("scoresaber")) {
                    let isExist = await Scoresaber.getplayerInfo(playerId)

                    if (!isExist) {
                        await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered on Scoresaber"))
                        return false
                    }

                } else if (leaderboard.includes("beatleader")) {
                    let isExist = await Beatleader.getplayerInfo(playerId)

                    if (!isExist) {
                        await interaction.editReply(SmallEmbed("❌ ┃ The player is not registered on Beatleader"))
                        return false
                    }
                }


                await interaction.editReply(SmallEmbed("Recovering player scores ..."))
                await Snipe.add(getSniperId.id, playerId, leaderboard)

                await interaction.editReply(SmallEmbed("✅ ┃ The player has been added to your list!"))

                cooldownAdd.add(interaction.member.id)
                setTimeout(function () {
                    cooldownAdd.delete(discordId)
                }, 60000)

                break
            }

            case 'remove': {

                if (cooldownRemove.has(discordId)) {
                    await interaction.editReply(SmallEmbed("❌ ┃ You have to wait 1 minutes before you can use this command again"))
                    return false
                }

                if (!snipeInfo) {
                    await interaction.editReply(SmallEmbed("❌ ┃ You didn't snipe at this player"))
                    return false
                }

                await Snipe.remove(snipeInfo.id)
                await interaction.editReply(SmallEmbed("✅ ┃ The player has been removed from your list"))

                cooldownRemove.add(interaction.member.id)
                setTimeout(function () {
                    cooldownRemove.delete(discordId)
                }, 60000)

                break
            }
        }
    }
}