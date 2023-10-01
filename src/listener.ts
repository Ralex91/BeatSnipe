import WebSocket from 'ws'
import Normalizer from './Utils/normalizer.js'
import Comparator from './Controllers/comparator.js'
import isJsonString from './Utils/isJsonString.js';

function startWebSocketSS() {
    const ScoreSaber = new WebSocket('wss://scoresaber.com/ws')

    ScoreSaber.on('error', console.error)

    ScoreSaber.on('open', function open() {
        console.log('ScoreSaber connected')
    })

    ScoreSaber.on('message', async function message(data: string) {
        if (!isJsonString(data)) return console.log(data)

        let parseData = JSON.parse(data)
        let score = await Normalizer.ScoreSaber(parseData.commandData)

        Comparator(score, "scoresaber")
    })

    ScoreSaber.on('close', () => {
        console.log("[SS] WebSocket closed")

        setTimeout(function () {
            startWebSocketSS()
        }, 10 * 1000)
    })
}

function startWebSocketBL() {
    const BeatLeader = new WebSocket('wss://api.beatleader.xyz/scores')

    BeatLeader.on('error', console.error)

    BeatLeader.on('open', function open() {
        console.log('BeatLeader connected')
    })

    BeatLeader.on('close', () => {
        console.log("[BL] WebSocket closed")

        setTimeout(function () {
            startWebSocketBL()
        }, 10 * 1000)
    })

    BeatLeader.on('message', async function message(data: string) {
        if (!isJsonString(data)) return console.log(data)

        let parseData = JSON.parse(data)
        let score = Normalizer.BeatLeader(parseData)

        Comparator(score, "beatleader")
    })
}

startWebSocketSS()
startWebSocketBL()