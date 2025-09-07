import { notified } from "@constants"
import checkGitlab from "@utils/checkGitlab"
import checkOnePassword from "@utils/checkOnePassword"
import heartbeat from "@utils/heartbeat"
import { schedule } from "node-cron"

const oneDay = 24 * 60 * 60 * 1000

async function scout() {
    // schedule('*/5 * * * *', async() => {
        const startTimeRaw = new Date()
        const startTime = startTimeRaw.toLocaleString('nb-NO', {
            timeZone: 'Europe/Oslo',
        })

        console.log(`🐝 Started scouting at ${startTime}...`)

        await checkOnePassword()
        await checkGitlab()

        const stoppedTimeRaw = new Date()
        const stoppedTime = stoppedTimeRaw.toLocaleString('nb-NO', {
            timeZone: 'Europe/Oslo',
        })

        const now = Date.now()

        notified.critical = notified.critical.filter(notification => {
            return (now - new Date(notification.time).getTime()) < oneDay
        })

        notified.high = notified.high.filter(notification => {
            return (now - new Date(notification.time).getTime()) < oneDay
        })

        notified.medium = notified.medium.filter(notification => {
            return (now - new Date(notification.time).getTime()) < oneDay
        })

        await heartbeat()

        const duration = (stoppedTimeRaw.getTime() - startTimeRaw.getTime()) / 1000
        console.log(`🐝 Stopped scouting at ${stoppedTime} (${duration}s)...`)
    // })
}

scout()
