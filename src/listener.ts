import { ComparatorService } from "@/services/comparator.service"
import Normalizer from "@/utils/normalizer.js"
import { BeatLeaderSocket } from "./sockets/beatleader.socket"
import { ScoreSaberSocket } from "./sockets/scoresaber.socket"
import { LEADERBOARD } from "./utils/contantes"

const scoreSaberSocket = new ScoreSaberSocket()

scoreSaberSocket.addMessageHandler(async (data) => {
  const score = Normalizer.scoreSaber(data)

  try {
    const service = new ComparatorService(LEADERBOARD.ScoreSaber)
    await service.run(score)
  } catch (err) {
    console.error("[ScoreSaber Comparator] Error:", err)
  }
})

scoreSaberSocket.start()

const beatLeaderSocket = new BeatLeaderSocket()

beatLeaderSocket.addMessageHandler(async (data) => {
  const score = Normalizer.beatLeader(data)

  try {
    const service = new ComparatorService(LEADERBOARD.BeatLeader)
    await service.run(score)
  } catch (err) {
    console.error("[BeatLeader Comparator] Error:", err)
  }
})

beatLeaderSocket.start()
