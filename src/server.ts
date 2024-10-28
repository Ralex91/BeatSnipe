import bodyParser from "body-parser"
import compression from "compression"
import cors from "cors"
import "dotenv/config"
import express, { Request, Response } from "express"

import { apiRouter } from "@/Api/router"
import "@/Discord/discord"

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.disable("x-powered-by")
app.set("trust proxy", false)
app.use(cors())

app.use(compression({ level: 9 }))

app.use("/api/", apiRouter)

app.get("/discord", (req: Request, res: Response) => {
  if (!process.env.DISCORD_INVITE) {
    res.json({
      code: 403,
      message: "DISCORD_INVITE undefined",
    })

    return
  }

  res.redirect(process.env.DISCORD_INVITE)
})

app.get("*", (req: Request, res: Response) => {
  res.json({
    code: 404,
    message: "Page not found",
  })
})

app.listen(process.env.WEB_PORT, () => {
  console.log(`BeatSnipe listening on port ${process.env.WEB_PORT}`)
})
