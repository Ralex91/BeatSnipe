import { ScoreRepository } from "@/repositories/score.repository"
import { SnipeRepository } from "@/repositories/snipe.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { Comparator } from "@/types/comparator"
import { PlayerInfo } from "@/types/player"
import { LEADERBOARD } from "@/utils/contants"
import { Logger } from "@/utils/logger"
import { difficultyColor } from "@/utils/score"
import chalk from "chalk"

export class ComparatorService {
  private leaderboard: string
  private prefix: string | null
  private scoreService: typeof ScoreSaberService | typeof BeatLeaderService

  private static getShortName(leaderboard: string): string | null {
    if (leaderboard === LEADERBOARD.ScoreSaber) {
      return "SS"
    }

    if (leaderboard === LEADERBOARD.BeatLeader) {
      return "BL"
    }

    return null
  }

  constructor(leaderboard: string) {
    this.leaderboard = leaderboard
    this.prefix = ComparatorService.getShortName(leaderboard)

    if (!this.prefix) {
      throw new Error("Invalid leaderboard")
    }

    this.scoreService =
      leaderboard === LEADERBOARD.ScoreSaber
        ? ScoreSaberService
        : BeatLeaderService
  }

  async run(scoreData: Comparator) {
    await this.checkNewSnipeScore(scoreData)
    await this.checkSniperBeatScore(scoreData)
  }

  private async checkNewSnipeScore(scoreData: Comparator) {
    const {
      hash,
      name,
      difficulty,
      gamemode,
      baseScore,
      playerId,
      playerName,
    } = scoreData

    const sniper = await SnipeRepository.getSnipers(playerId)

    if (!sniper) {
      return
    }

    const sniperInfo: PlayerInfo | null = await this.scoreService.getPlayerInfo(
      sniper.sniperId,
    )

    if (!sniperInfo) {
      return
    }

    let sniperScore: number | null = null

    if (this.leaderboard === LEADERBOARD.ScoreSaber) {
      sniperScore = await ScoreSaberService.getPlayerScoreMap(
        sniperInfo.name,
        hash,
        difficulty,
        gamemode,
      )
    } else {
      sniperScore = await BeatLeaderService.getPlayerScoreMap(
        sniper.sniperId,
        hash,
        difficulty,
        gamemode,
      )
    }

    if (!sniperScore) {
      return
    }

    const isBeat: boolean = sniperScore < baseScore

    Logger.log(
      this.leaderboard,
      `${playerName} attempted snipe a score on ${chalk.bold(name)} | ${difficultyColor(
        difficulty,
      )}`,
    )
    Logger.comparison(this.leaderboard, sniperScore, baseScore, isBeat)

    if (isBeat) {
      return
    }

    Logger.log(
      this.leaderboard,
      `${chalk.red.bold("SNIPED")}: ${playerName} snipe ${sniperInfo.name} on ${chalk.bold(name)} | ${difficultyColor(
        difficulty,
      )}`,
    )

    const existing = await ScoreRepository.get({
      playerId,
      snipeId: sniper.id,
      hash,
      leaderboard: this.leaderboard,
      difficulty,
      gamemode,
    })

    if (existing) {
      await ScoreRepository.delete(existing.id)
    }

    await ScoreRepository.add({
      name,
      playerId,
      snipeId: sniper.id,
      hash,
      leaderboard: this.leaderboard,
      score: baseScore,
      difficulty,
      gamemode,
    })
  }

  private async checkSniperBeatScore(scoreData: Comparator) {
    const {
      hash,
      name,
      difficulty,
      gamemode,
      baseScore,
      playerId,
      playerName,
    } = scoreData

    const snipes = await ScoreRepository.getPlayerLeaderboardScores({
      playerId,
      hash,
      difficulty,
      gamemode,
      leaderboard: this.leaderboard,
    })

    if (!snipes) {
      return
    }

    const idsToDelete = []

    for (const snipe of snipes) {
      const isBeat: boolean = snipe.score < baseScore

      Logger.log(
        this.leaderboard,
        `${playerName} ${isBeat ? "beat" : "doesn't beat"} ${snipe.snipe.playerId} on ${chalk.bold(name)} | ${difficultyColor(difficulty)}`,
      )
      Logger.comparison(this.leaderboard, snipe.score, baseScore, isBeat)

      if (isBeat) {
        idsToDelete.push(snipe.id)
      }
    }

    if (idsToDelete.length > 0) {
      await ScoreRepository.deleteMany(idsToDelete)
    }
  }
}
