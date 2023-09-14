import fs from 'fs'
import type Event from '../Templates/Events'
import path from 'path'

export default async (client) => {

	const eventsFiles = fs.readdirSync(path.join(__dirname, '../Events')).filter(file => file.endsWith('.js'))

	for (const file of eventsFiles) {
		const event: Event = (await import(`../Events/${file}`)).default as Event

		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client))
		} else {
			client.on(event.name, (...args) => event.execute(...args, client))
		}
	}

}