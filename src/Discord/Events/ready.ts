import { Events, ActivityType } from 'discord.js'
import Event from '../Templates/Events'
import 'dotenv/config'

export default new Event({
	name: Events.ClientReady,
	once: true,
	execute(): void {
		client.user.setActivity(`Version ${process.env.DISPLAY_VERSION}`, { type: ActivityType.Watching })
		console.log(`Logged in as ${client.user?.tag as string}!`)
	}
})