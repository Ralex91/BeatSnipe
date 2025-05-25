import { Context, Hono } from "hono"
import { StatusCodes } from "http-status-codes"

const router = new Hono()

router.get("/", (c: Context) => {
  if (!process.env.DISCORD_INVITE) {
    return c.json(
      {
        error: "DISCORD_INVITE is not set",
      },
      StatusCodes.NOT_IMPLEMENTED,
    )
  }

  return c.redirect(process.env.DISCORD_INVITE)
})

export default router
