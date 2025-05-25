import "@/discord/discord"
import discordRoutes from "@/routes/discord"
import playlistRoutes from "@/routes/playlist"
import { Hono } from "hono"
import { StatusCodes } from "http-status-codes"

const app = new Hono()

app.get("/", (c) => c.json({ message: "Welcome to BeatSnipe API" }))

app
  .basePath("/api")
  .route("/playlist", playlistRoutes)
  .route("/discord", discordRoutes)

app.notFound((c) => c.json({ error: "Not found" }, StatusCodes.NOT_FOUND))

export default {
  port: process.env.WEB_PORT,
  fetch: app.fetch,
}
