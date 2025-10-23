import heartbeat from "@utils/heartbeat"
import { fork } from "child_process"
import path from "path"
import { notifiedVulnerabilities, notifiedSecrets } from "@constants"
import schedule from "node-schedule"

async function scout() {
    setInterval(async () => {
        try {
            await heartbeat()
        } catch (err) {
            console.error("Heartbeat failed:", err)
        }
    }, 60 * 1000)

    schedule.scheduleJob('*/15 * * * *', async() => {
        const workerPath = path.join(__dirname, "utils/scout.js")
        const child = fork(workerPath)
        child.send({
            type: "init",
            notifiedVulnerabilities,
            notifiedSecrets
        })

        child.on("message", (msg: any) => {
            if (msg.type === "updateAllVulnerabilities") {
                Object.assign(notifiedVulnerabilities, msg.data)
                console.log("🐝 Updated notified vulnerabilities:", Object.values(notifiedVulnerabilities).map(arr => arr.length))
            }

            if (msg.type === "updateAllSecrets") {
                Object.assign(notifiedSecrets, msg.data)
                console.log("🐝 Updated notified secrets:", Object.values(notifiedSecrets).map(arr => arr.length))
            }
        })

        child.on("exit", code => {
            console.log(`🐝 Scout exited with code ${code}`)
        })

        child.on("error", err => {
            console.error("🐝 Scout process error:", err)
        })
    })
}

scout()
