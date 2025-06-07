/* eslint-disable no-undef */
import { PrismaClient } from "@prisma/client"
import chalk from "chalk"
import wait from "../src/libs/wait"
import { ScoreRepository } from "../src/repositories/score.repository"
import { SnipeService } from "../src/services/snipe.service"

const db = new PrismaClient()

async function main() {
  const getAllSnipe = await db.snipe.findMany()

  console.log(
    chalk.yellow(`\n🟡 Found ${getAllSnipe.length} snipes to refresh.\n`),
  )

  for (const [index, snipe] of getAllSnipe.entries()) {
    const prefix = chalk.cyan(`🔁 [${index + 1}/${getAllSnipe.length}]`)
    const playerInfo = chalk.blue(`${snipe.playerId} on ${snipe.leaderboard}`)

    console.log(`${prefix} Refreshing ${playerInfo}...`)

    await ScoreRepository.deleteScores(snipe.id)
    await SnipeService.add(
      snipe.sniperId,
      snipe.playerId,
      snipe.leaderboard,
      snipe.id,
    )

    console.log(chalk.green(`✅ Refreshed ${playerInfo}.`))
    console.log(chalk.gray(`⏳ Waiting 5 seconds before next refresh...\n`))
    await wait(5)
  }

  console.log(chalk.bold.green("🎉 All snipes refreshed!\n"))
}

main()
