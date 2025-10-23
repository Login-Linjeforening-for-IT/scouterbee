import config from "#constants"

const CRITICAL_ROLE_DEV = config.CRITICAL_ROLE_DEV

type FinalReport = {
    title: string
    description: string
    highestSeverity: Severity
}

export default async function alert(finalReport: FinalReport) {
    try {
        let data: { content?: string; embeds: any[] } = {
            embeds: [
                {
                    title: finalReport.title,
                    description: finalReport.description,
                    color: finalReport.highestSeverity === 'critical' ? 0x800080 : 0xff0000,
                    timestamp: new Date().toISOString()
                }
            ]
        }

        if (finalReport.highestSeverity === 'critical') {
            data.content = `🐝 <@&${CRITICAL_ROLE_DEV}> 🐝`
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
