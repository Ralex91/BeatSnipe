import smallEmbed from "@/discord/handlers/smallEmbed"
import { PrismaClient } from "@prisma/client"
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

const prisma = new PrismaClient()

export default {
  data: new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Unlink your account id to BeatSnipe"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true })
    const discordId = interaction.user.id

    await interaction.editReply(
      smallEmbed(
        "<a:loading:1158674816136659006> ┃ Your unlink in progress ...",
      ),
    )

    const player = await prisma.player.findUnique({
      where: {
        discordId,
      },
    })

    if (!player) {
      await interaction.editReply(
        smallEmbed(
          "❌ ┃ No account link! Link your account with </link:1151622228639760465>",
        ),
      )

      return
    }

    await prisma.player.delete({
      where: {
        discordId,
      },
    })

    await interaction.editReply(
      smallEmbed(
        "✅ ┃ Your account has been unlink and sniped/playlist players have been deleted",
      ),
    )
  },
}
