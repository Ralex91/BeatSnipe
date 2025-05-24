import { Context, Hono } from "hono"

const router = new Hono()

router.get("/", (c: Context) => {
  if (!process.env.DISCORD_INVITE) {
    return c.json(
      {
        code: 403,
        message: "DISCORD_INVITE undefined",
      },
      403,
    )
  }

  return c.redirect(process.env.DISCORD_INVITE)
})

export default router
