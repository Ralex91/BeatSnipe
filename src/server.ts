import discordRoutes from "@/routes/discord"
import playlistRoutes from "@/routes/playlist"
import "dotenv/config"
import { Hono } from "hono"

import "@/discord/discord"

const app = new Hono()

app.get("/", (c) => c.json({ message: "Welcome to BeatSnipe API" }))

app
  .basePath("/api")
  .route("/playlist", playlistRoutes)
  .route("/discord", discordRoutes)

app.notFound((c) => c.json({ code: 404, message: "Not found" }, 404))

export default {
  port: process.env.WEB_PORT,
  fetch: app.fetch,
}
