import config from "@constants"

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

        const data = await response.json()
        return data
    } catch (error) {
        console.log(error)
    }
}
