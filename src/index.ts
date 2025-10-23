import heartbeat from '#utils/heartbeat.ts'
import { fork } from 'child_process'
import { fileURLToPath } from 'url'
import { notifiedVulnerabilities, notifiedSecrets } from '#constants'
import schedule from 'node-schedule'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

async function scout() {
    setInterval(async () => {
        try {
            await heartbeat()
        } catch (err) {
            console.error('Heartbeat failed:', err)
        }
    }, 60 * 1000)

    schedule.scheduleJob('*/15 * * * *', async() => {
        const workerPath = path.join(__dirname, 'utils/scout.ts')
        let child = fork(workerPath)
        child.send({
            type: 'init',
            notifiedVulnerabilities,
            notifiedSecrets
        })

        child.on('message', (msg: any) => {
            if (msg.type === 'updateAllVulnerabilities') {
                Object.assign(notifiedVulnerabilities, msg.data)
                console.log('🐝 Updated notified vulnerabilities:', Object.values(notifiedVulnerabilities).map(arr => arr.length))
            }

            if (msg.type === 'updateAllSecrets') {
                Object.assign(notifiedSecrets, msg.data)
                console.log('🐝 Updated notified secrets:', Object.values(notifiedSecrets).map(arr => arr.length))
            }
        })

        child.on('exit', code => {
            console.log(`🐝 Scout exited with code ${code}`)
            child.removeAllListeners()
            setImmediate(() => child.unref())
            // @ts-ignore
            child = null
        })

        child.on('error', err => {
            console.error('🐝 Scout process error:', err)
            child.removeAllListeners()
            setImmediate(() => child.unref())
            // @ts-ignore
            child = null
        })
    })
}

scout()
