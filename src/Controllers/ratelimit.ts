import { Request, Response, NextFunction } from 'express'
import exRateLimit from 'express-rate-limit'

export const rateLimit = (time: number, max: number) => {
    return exRateLimit({
        windowMs: time,
        max: max,
        handler: (request: Request, response: Response, next: NextFunction, options: any) => {
            response.status(429).json({
                'code': 429,
                'message': 'Rate limited, please try again later',
            });
        }
    })
}
