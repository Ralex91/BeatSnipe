import express, { Request, Response } from 'express'

import bodyParser from 'body-parser'
import cors from 'cors'
import compression from 'compression'
import 'dotenv/config'

import { apiRouter } from './Api/router'
import './Discord/discord'

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.disable('x-powered-by');
app.set('trust proxy', false);
app.use(cors());

app.use(compression({ level: 9 }));

app.use('/api/', apiRouter);

app.get('/discord', function (req: Request, res: Response) {
    res.redirect(process.env.DISCORD_INVITE)
});

/* Error 404 */
app.get('*', function (req: Request, res: Response) {
    res.json({
        code: 404,
        message: "Page not found"
    });
});

app.listen(process.env.WEB_PORT, () => {
    console.log(`ScoreSniper listening on port ${process.env.WEB_PORT}`);
});