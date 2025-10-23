import config from '#constants'

const CRITICAL_ROLE_INFRA = config.CRITICAL_ROLE_INFRA

export default async function alertExpired(ping: boolean, red: boolean, finalReport: string) {
    try {
        let data: { content?: string; embeds: any[] } = {
            embeds: [
                {
                    title: '🐝 Secret Report 🐝',
                    description: finalReport,
                    color: ping || red ? 0xff0000 : 0xfd8738,
                    timestamp: new Date().toISOString()
                }
            ]
        }

        if (ping) {
            data.content = `🐝 <@&${CRITICAL_ROLE_INFRA}> 🐝`
        }

        const response = await fetch(config.WEBHOOK_URL ?? '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        return response.status
    } catch (error) {
        console.log(error)
    }
}
