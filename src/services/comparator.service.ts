import { ScoreRepository } from "@/repositories/score.repository"
import { SnipeRepository } from "@/repositories/snipe.repository"
import { BeatLeaderService } from "@/services/beatleader.service"
import { ScoreSaberService } from "@/services/scoresaber.service"
import { Comparator } from "@/types/comparator"
import { PlayerInfo } from "@/types/player"
import { LEADERBOARD } from "@/utils/contantes"

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

    console.log(
      `[${this.prefix}] ${playerName} attempted snipe a score on ${name} | ${difficulty}`,
    )
    console.log(`[${this.prefix}] ${sniperScore} vs ${baseScore}`)

    if (sniperScore > baseScore) {
      return
    }

    console.log(
      `[${this.prefix}] Snipe Alert: ${playerName} snipe ${sniperInfo.name} on ${name} | ${difficulty}`,
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

    for (const snipe of snipes) {
      if (snipe.score < baseScore) {
        console.log(
          `[${this.prefix}] ${playerName} beat a score of ${snipe.snipe.playerId} on ${name} | ${difficulty}`,
        )
        console.log(`[${this.prefix}] ${snipe.score} < ${baseScore}`)
        await ScoreRepository.delete(snipe.id)
      } else {
        console.log(
          `[${this.prefix}] ${playerName} doesn't beat ${snipe.snipe.playerId} on ${name} | ${difficulty}`,
        )
        console.log(`[${this.prefix}] ${snipe.score} > ${baseScore}`)
      }
    }
  }
}
