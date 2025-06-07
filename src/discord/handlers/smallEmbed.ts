import { EMBED_COLORS } from "@/utils/contants"

export default function smallEmbed(text: string) {
  return {
    embeds: [
      {
        color: EMBED_COLORS.primary,
        description: `**${text}**`,
      },
    ],
  }
}
