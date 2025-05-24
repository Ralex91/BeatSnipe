import comparator from "@/controllers/comparator.js"
import Normalizer from "@/utils/normalizer.js"
import { BeatLeaderSocket } from "./sockets/beatleader.socket"
import { ScoreSaberSocket } from "./sockets/scoresaber.socket"
import { LEADERBOARD } from "./utils/contantes"

const scoreSaberSocket = new ScoreSaberSocket()

scoreSaberSocket.addMessageHandler((data) => {
  const score = Normalizer.scoreSaber(data)
  comparator(score, LEADERBOARD.ScoreSaber)
})

scoreSaberSocket.start()

const beatLeaderSocket = new BeatLeaderSocket()

beatLeaderSocket.addMessageHandler((data) => {
  const score = Normalizer.beatLeader(data)
  comparator(score, LEADERBOARD.BeatLeader)
})

beatLeaderSocket.start()
