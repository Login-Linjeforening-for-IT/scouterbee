import scoutGitlab from "./scoutGitlab.ts"
import scoutOnePassword from "./scoutOnePassword.ts"

let notifiedVulnerabilities: NotifiedVulnerabilities = {
    critical: [],
    high: [],
    medium: []
}

let notifiedSecrets: NotifiedSecrets = {
    hasExpired: [],
    expiresNextWeek: [],
    expiresNextMonth: []
}

const oneDay = 24 * 60 * 60 * 1000

process.on("message", (msg: {
    type: string
    notifiedVulnerabilities: NotifiedVulnerabilities
    notifiedSecrets: NotifiedSecrets
}) => {
    if (msg.type === "init") {
        notifiedVulnerabilities = msg.notifiedVulnerabilities
        notifiedSecrets = msg.notifiedSecrets
        scout()
    }
})

async function scout() {
    const startTimeRaw = new Date()
    const startTime = startTimeRaw.toLocaleString('nb-NO', {
        timeZone: 'Europe/Oslo',
    })

    console.log(`🐝 Started scouting at ${startTime}...`)

    const newNotifiedSecrets = await scoutOnePassword(notifiedSecrets)
    const now = Date.now()
    for (const level of ["hasExpired", "expiresNextWeek", "expiresNextMonth"] as const) {
        newNotifiedSecrets[level] = newNotifiedSecrets[level].filter(n => (now - n.seen) < oneDay)
    }

    process.send?.({ type: "updateAllSecrets", data: newNotifiedSecrets })

    const newNotifiedVulnerabilities = await scoutGitlab(notifiedVulnerabilities)
    for (const level of ["critical", "high", "medium"] as const) {
        newNotifiedVulnerabilities[level] = newNotifiedVulnerabilities[level].filter(n => (now - new Date(n.time).getTime()) < oneDay)
    }

    process.send?.({ type: "updateAllVulnerabilities", data: newNotifiedVulnerabilities })

    const stoppedTimeRaw = new Date()
    const stoppedTime = stoppedTimeRaw.toLocaleString('nb-NO', {
        timeZone: 'Europe/Oslo',
    })

    const duration = (stoppedTimeRaw.getTime() - startTimeRaw.getTime()) / 1000
    console.log(`🐝 Stopped scouting at ${stoppedTime} (${duration}s)...`)
}
