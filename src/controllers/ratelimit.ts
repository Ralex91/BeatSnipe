import { Request, Response } from "express"
import exRateLimit from "express-rate-limit"

export const rateLimit = (time: number, max: number) =>
  exRateLimit({
    windowMs: time,
    max,
    handler: (request: Request, response: Response) => {
      response.status(429).json({
        code: 429,
        message: "Rate limited, please try again later",
      })
    },
  })
