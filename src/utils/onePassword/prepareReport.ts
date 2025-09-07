type PreparedReport = {
    ping: boolean
    red: boolean
    finalReport: string
    secretsToReport: boolean
}

export default function prepareReport(items: ExpiresAlert): PreparedReport {
    let finalReport = ''
    let ping = false
    let red = false
    let secretsToReport = false

    if (items.hasExpired.length > 0) {
        secretsToReport = true
        finalReport += '🚨 **Has expired**\n'
    }

    for (const item of items.hasExpired) {
        const isProd = item.vault.includes('prod')

        if (isProd) {
            ping = true
        } else {
            red = true
        }

        finalReport += `${item.title} (${isProd ? 'prod' : 'dev'})\n`
        finalReport += item.time + '\n'
    }

    if (items.expiresNextWeek.length > 0) {
        secretsToReport = true
        finalReport += '🚨 **Expires in less than a week**\n'
    }

    for (const item of items.expiresNextWeek) {
        const isProd = item.vault.includes('prod')

        if (isProd) {
            ping = true
        }

        finalReport += `${item.title} (${isProd ? 'prod' : 'dev'})\n`
        finalReport += item.time + '\n'
    }

    if (items.expiresNextMonth.length > 0) {
        secretsToReport = true
        finalReport += '🚨 **Expires in less than a month**\n'
    }

    for (const item of items.expiresNextMonth) {
        const isProd = item.vault.includes('prod')
        finalReport += `${item.title} (${isProd ? 'prod' : 'dev'})\n`
        finalReport += item.time + '\n'
    }


    return { ping, red, finalReport, secretsToReport }
}
