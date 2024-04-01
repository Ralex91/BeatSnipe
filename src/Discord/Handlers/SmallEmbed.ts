export default function smallEmbed(text: string) {
  return {
    embeds: [
      {
        color: 0xff0000,
        description: `**${text}**`,
      },
    ],
  }
}
