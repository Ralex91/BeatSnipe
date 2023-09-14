import WebSocket from 'ws'
import Normalizer from './Utils/normalizer.js'
import Comparator from './Controllers/comparator.js'
import isJsonString from './Utils/isJsonString.js';

var ScoreSaber, BeatLeader

function startWebSocketSS() {
    ScoreSaber = new WebSocket('wss://scoresaber.com/ws')
}

function startWebSocketBL() {
    BeatLeader = new WebSocket('wss://api.beatleader.xyz/scores')
}

startWebSocketSS()
startWebSocketBL()

ScoreSaber.on('error', console.error)
BeatLeader.on('error', console.error)

ScoreSaber.on('open', function open() {
    console.log('ScoreSaber connected')
})

BeatLeader.on('open', function open() {
    console.log('BeatLeader connected')
})


ScoreSaber.on('close', () => {
    console.log("[SS] WebSocket closed")

    setTimeout(function () {
        startWebSocketSS()
    }, 10 * 1000)
})

BeatLeader.on('close', () => {
    console.log("[BL] WebSocket closed")

    setTimeout(function () {
        startWebSocketBL()
    }, 10 * 1000)
})

ScoreSaber.on('message', async function message(data: string) {
    if (!isJsonString(data)) return console.log(data)

    let parseData = JSON.parse(data)
    let score = await Normalizer.ScoreSaber(parseData.commandData)

    Comparator.compareSS(score)
})


BeatLeader.on('message', async function message(data: string) {
    if (!isJsonString(data)) return console.log(data)

    let parseData = JSON.parse(data)
    let score = Normalizer.BeatLeader(parseData)

    Comparator.compareBL(score)
})