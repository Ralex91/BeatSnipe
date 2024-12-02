import comparator from "@/controllers/comparator.js"
import isJsonString from "@/libs/isJsonString.js"
import Normalizer from "@/utils/normalizer.js"
import { WebSocket } from "ws"

function startWebSocketSS() {
  const ScoreSaber = new WebSocket("wss://scoresaber.com/ws")

  ScoreSaber.on("error", (err) => {
    console.error("Socket encountered error: ", err.message, "Closing socket")
    ScoreSaber.close()
  })

  //
  // ScoreSaber.on('open', function open() {
  //     console.log('ScoreSaber connected')
  // })
  //

  ScoreSaber.on("message", async (data: string) => {
    if (!isJsonString(data)) {
      return
    }

    const parseData = JSON.parse(data)
    const score = await Normalizer.scoreSaber(parseData.commandData)

    comparator(score, "scoresaber")
  })

  ScoreSaber.on("close", () => {
    //console.log("[SS] WebSocket closed")

    setTimeout(() => {
      startWebSocketSS()
    }, 1000)
  })
}

function startWebSocketBL() {
  const BeatLeader = new WebSocket("wss://sockets.api.beatleader.xyz/scores")

  BeatLeader.on("error", (err) => {
    console.error("Socket encountered error: ", err.message, "Closing socket")
    BeatLeader.close()
  })

  //
  // BeatLeader.on('open', function open() {
  //     console.log('BeatLeader connected')
  // })
  //

  BeatLeader.on("close", () => {
    //console.log("[BL] WebSocket closed")

    setTimeout(() => {
      startWebSocketBL()
    }, 1000)
  })

  BeatLeader.on("message", (data: string) => {
    if (!isJsonString(data)) {
      return
    }

    const parseData = JSON.parse(data)
    const score = Normalizer.beatLeader(parseData)

    comparator(score, "beatleader")
  })
}

startWebSocketSS()
startWebSocketBL()
