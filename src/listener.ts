import { ComparatorService } from "@/services/comparator.service"
import { BeatLeaderSocket } from "./sockets/beatleader.socket"
import { ScoreSaberSocket } from "./sockets/scoresaber.socket"
import { LEADERBOARD } from "./utils/contants"
import { Logger } from "./utils/logger"
import { ScoreNormalizer } from "./utils/normalizer"

const scoreSaberSocket = new ScoreSaberSocket()

scoreSaberSocket.addMessageHandler(async (data) => {
  const score = ScoreNormalizer.scoreSaber(data)

  try {
    const service = new ComparatorService(LEADERBOARD.ScoreSaber)
    await service.run(score)
  } catch (err) {
    Logger.error(LEADERBOARD.ScoreSaber, err as string)
  }
})

scoreSaberSocket.start()

const beatLeaderSocket = new BeatLeaderSocket()

beatLeaderSocket.addMessageHandler(async (data) => {
  const score = ScoreNormalizer.beatLeader(data)

  try {
    const service = new ComparatorService(LEADERBOARD.BeatLeader)
    await service.run(score)
  } catch (err) {
    Logger.error(LEADERBOARD.BeatLeader, err as string)
  }
})

beatLeaderSocket.start()
