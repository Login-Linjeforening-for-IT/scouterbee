import heartbeat from '#utils/heartbeat.ts'
import schedule from '#utils/schedule.ts'
import scoutOnePassword from '#utils/scoutOnePassword.ts'
import scoutProjects from '#utils/scoutProjects.ts'

async function main() {
    schedule(heartbeat, 1)
    schedule(scoutOnePassword)
    schedule(scoutProjects, 1)
}

main()
