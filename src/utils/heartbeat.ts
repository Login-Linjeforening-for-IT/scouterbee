import config from "#constants"

export default async function heartbeat() {
    try {
        const url = config.HEARTBEAT_URL
        if (!url) {
            throw new Error('Missing heartbeat url.')
        }

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const now = new Date().toLocaleString('nb-NO', {
            timeZone: 'Europe/Oslo',
        })

        const data = await response.json()
        console.log(`🐝 Heartbeat ${now}`, data)
        return data
    } catch (error) {
        console.log(error)
    }
}
