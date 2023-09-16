import { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } from 'discord.js'
import playlist from '../../Utils/playlist.js'
import { PrismaClient } from '@prisma/client'
import fetch from 'phin';
import SmallEmbed from '../Handlers/SmallEmbed.js';

const prisma = new PrismaClient();
const cooldown = new Set();

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

        let playerId = interaction.options.getString('player')
        let discordId = interaction.guild !== null ? interaction.member.id : interaction.user.id
        let leaderboard = interaction.options.getString('leaderboard')

        if (cooldown.has(discordId)) {
            await interaction.editReply(SmallEmbed("⏱ ┃ You have to wait 20 seconde before you can use the playlist commands again"))
            return false
        }

        let snippe = await prisma.snipe.findFirst({
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

        if (snippe) {
            if (!snippe.leaderboard.split(",").includes(leaderboard)) {
                interaction.editReply(SmallEmbed("❌ ┃ The snipe is not active on this leaderboard"))
                return false
            }

            var playerInfo: any

            if (leaderboard === "scoresaber") {
                let fetchPlayer: any = await fetch({
                    url: `https://scoresaber.com/api/player/${playerId}/basic/`,
                    method: "GET",
                    parse: "json"
                })

                playerInfo = {
                    name: fetchPlayer.body.name
                }
            }

            if (leaderboard === "beatleader") {
                let fetchPlayer: any = await fetch({
                    url: `https://api.beatleader.xyz/player//${playerId}?stats=false&keepOriginalId=false`,
                    method: "GET",
                    parse: "json"
                })

                playerInfo = {
                    name: fetchPlayer.body.name
                }
            }

            await interaction.editReply(SmallEmbed("Playlist generation in progress..."))

            let playlistContent = await playlist(leaderboard, snippe.id)
            const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify(playlistContent)), { name: playerInfo.name + '_Snipe_playlist_' + leaderboard + '.bplist' })

            await interaction.editReply({ embeds: [{ color: 0xff0000, title: `✅ ┃ Snipe's playlist is ready` }], files: [attachment] })
        } else {
            interaction.editReply(SmallEmbed("❌ ┃ Snipe not found"))
        }

        cooldown.add(interaction.member.id);
        setTimeout(function () {
            cooldown.delete(discordId);
        }, 20000);
    }
}