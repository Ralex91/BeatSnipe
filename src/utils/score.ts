import chalk from "chalk"
import { fetch } from "./fetch"
//
//  getMapMaxScore, calcAcc:
//  https://github.com/Hei5enberg44/BSFR-Cube-Stalker/blob/master/src/controllers/top1.ts
//

async function getMapDetails(hash: string) {
  const mapDetails = await fetch
    .get(`https://beatsaver.com/api/maps/hash/${hash}`)
    .json()

  return mapDetails
}

function getMapMaxScore(notes: number) {
  let maxScore: number = 0

  if (notes < 14) {
    if (notes === 1) {
      maxScore = 115
    } else if (notes < 5) {
      maxScore = (notes - 1) * 230 + 115
    } else {
      maxScore = (notes - 5) * 460 + 1035
    }
  } else {
    maxScore = (notes - 13) * 920 + 4715
  }

  return maxScore
}

async function calcAcc(
  hash: string,
  levelDifficulty: string,
  levelGameMode: string,
  score: number,
) {
  const mapDetails: any = await getMapDetails(hash)
  const notes = mapDetails.versions[0].diffs.find(
    (diff: any) =>
      diff.difficulty === levelDifficulty &&
      diff.characteristic === levelGameMode,
  )
  const maxScore = getMapMaxScore(notes)

  return (score / maxScore) * 100
}

export const difficultyColor = (difficulty: string) => {
  let color = null

  switch (difficulty.toLowerCase()) {
    case "easy":
      color = chalk.bgGreen

      break

    case "normal":
      color = chalk.bgBlue

      break

    case "hard":
      color = chalk.bgHex("#FF6347")

      break

    case "expert":
      color = chalk.bgRed

      break

    case "expertplus":
      color = chalk.bgHex("#8F48DB")

      break

    default:
      color = chalk.bgWhite
  }

  return color(` ${difficulty} `)
}

export default {
  getMapMaxScore,
  calcAcc,
}
