import config from "@constants"

const CRITICAL_ROLE = config.CRITICAL_ROLE

type FinalReport = {
    title: string
    description: string
    highestSeverity: Severity
}

export default async function alert(finalReport: FinalReport) {
    try {
        const response = await fetch(config.WEBHOOK_URL ?? '', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [
                    {
                        title: finalReport.highestSeverity === 'critical'
                            ? `🐝 <@&${CRITICAL_ROLE}>${finalReport.title.slice(2)}`
                            : finalReport.title,
                        description: finalReport.description,
                        color: finalReport.highestSeverity === 'critical' ? 0xff0000 : 0xfd8738,
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.log(error)
    }
}
