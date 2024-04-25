import { PrismaClient } from "@prisma/client"
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import beatleader from "../../Controllers/beatleader"
import scoresaber from "../../Controllers/scoresaber"
import Snipe from "../../Controllers/snipe"
import smallEmbed from "../Handlers/SmallEmbed"

const prisma = new PrismaClient()
const cooldownAdd = new Set()
const cooldownRefresh = new Set()
const cooldownRemove = new Set()

export default {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Snipe command")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add the player to your snipe list")
        .addStringOption((option) =>
          option
            .setName("player")
            .setDescription("Player ID")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("leaderboard")
            .setDescription("Leaderboard(s) where the snipe will be active")
            .addChoices(
              { name: "scoresaber", value: "scoresaber" },
              { name: "beatleader", value: "beatleader" },
              {
                name: "scoresaber & beatleader",
                value: "scoresaber,beatleader",
              },
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("refresh")
        .setDescription("Refresh the player scores")
        .addStringOption((option) =>
          option
            .setName("player")
            .setDescription("Player ID")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a player from your snipe list")
        .addStringOption((option) =>
          option
            .setName("player")
            .setDescription("Player ID")
            .setRequired(true),
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const action = interaction.options.getSubcommand(true)
    const discordId = interaction.user.id
    await interaction.deferReply({ ephemeral: true })

    const sniper = await prisma.player.findFirst({
      where: {
        discordId,
      },
      select: {
        id: true,
      },
    })

    if (!sniper) {
      await interaction.editReply(
        smallEmbed(
          "❌ ┃ No account link! Link your account with </link:1151622228639760465>",
        ),
      )

      return
    }

    const playerId = interaction.options.getString("player")
    const leaderboard = interaction.options.getString("leaderboard")

    if (!playerId) {
      await interaction.editReply(smallEmbed("❌ ┃ Player ID is require"))

      return
    }

    const snipe = await prisma.snipe.findFirst({
      where: {
        playerId,
        sniperId: sniper.id,
      },
      select: {
        id: true,
        playerId: true,
        sniperId: true,
        leaderboard: true,
      },
    })

    switch (action) {
      case "add": {
        if (cooldownAdd.has(discordId)) {
          await interaction.editReply(
            smallEmbed(
              "⏱ ┃ You have to wait 1 minutes before you can use this command again",
            ),
          )

          return
        }

        if (playerId === discordId) {
          await interaction.editReply(
            smallEmbed("❌ ┃ You can't snipe yourself 🧠"),
          )

          return
        }

        if (!leaderboard) {
          await interaction.editReply(smallEmbed("❌ ┃ Leaderboard is require"))

          return
        }

        if (snipe) {
          await interaction.editReply(
            smallEmbed("❌ ┃ You already have a snipe on this player"),
          )

          return
        }

        const snipeTotal = await prisma.snipe.count({
          where: {
            sniperId: sniper.id,
          },
        })

        if (snipeTotal >= 5) {
          await interaction.editReply(
            smallEmbed(
              "❌ ┃ You have reached your snipe limit of 5 players at the same time",
            ),
          )

          return
        }

        if (leaderboard.includes("scoresaber")) {
          const isPlayerExistSS = await scoresaber.getPlayerInfo(playerId)
          const isSniperExistSS = await scoresaber.getPlayerInfo(sniper.id)

          if (!isPlayerExistSS) {
            await interaction.editReply(
              smallEmbed("❌ ┃ The player is not registered on scoresaber"),
            )

            return
          }

          if (!isSniperExistSS) {
            await interaction.editReply(
              smallEmbed("❌ ┃ Your account is not registered on scoresaber"),
            )

            return
          }
        }

        if (leaderboard.includes("beatleader")) {
          const isPlayerExistBL = await beatleader.getPlayerInfo(playerId)
          const isSniperExistBL = await beatleader.getPlayerInfo(sniper.id)

          if (!isPlayerExistBL) {
            await interaction.editReply(
              smallEmbed("❌ ┃ The player is not registered on beatleader"),
            )

            return
          }

          if (!isSniperExistBL) {
            await interaction.editReply(
              smallEmbed("❌ ┃ Your account is not registered on beatleader"),
            )

            return
          }
        }

        await interaction.editReply(
          smallEmbed(
            "<a:loading:1158674816136659006> ┃ Recovering player scores ...",
          ),
        )
        await Snipe.add(sniper.id, playerId, leaderboard)

        await interaction.editReply(
          smallEmbed("✅ ┃ The player has been added to your list!"),
        )

        cooldownAdd.add(discordId)
        setTimeout(() => {
          cooldownAdd.delete(discordId)
        }, 60000)

        break
      }

      case "refresh": {
        if (cooldownRefresh.has(discordId)) {
          await interaction.editReply(
            smallEmbed(
              "⏱ ┃ You have to wait 1 minutes before you can use this command again",
            ),
          )

          return
        }

        if (!snipe) {
          await interaction.editReply(
            smallEmbed("❌ ┃ You didn't snipe at this player"),
          )

          return
        }

        await interaction.editReply(
          smallEmbed(
            "<a:loading:1158674816136659006> ┃ Refresh player scores ...",
          ),
        )

        await prisma.score.deleteMany({
          where: {
            snipeId: snipe.id,
          },
        })

        await Snipe.add(sniper.id, snipe.playerId, snipe.leaderboard, snipe.id)

        await interaction.editReply(
          smallEmbed("✅ ┃ The player scores has been refresh!"),
        )

        setTimeout(() => {
          cooldownRefresh.delete(discordId)
        }, 60000)

        break
      }

      case "remove": {
        if (cooldownRemove.has(discordId)) {
          await interaction.editReply(
            smallEmbed(
              "⏱ ┃ You have to wait 1 minutes before you can use this command again",
            ),
          )

          return
        }

        if (!snipe) {
          await interaction.editReply(
            smallEmbed("❌ ┃ You didn't snipe at this player"),
          )

          return
        }

        await Snipe.remove(snipe.id)
        await interaction.editReply(
          smallEmbed("✅ ┃ The player has been removed from your list"),
        )

        cooldownRemove.add(discordId)
        setTimeout(() => {
          cooldownRemove.delete(discordId)
        }, 60000)

        break
      }
    }
  },
}
