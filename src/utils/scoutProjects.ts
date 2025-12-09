import { execSync } from 'child_process'
import alert from './projects/alert.ts'
import scoutRepositories from './projects/scoutRepositories.ts'
import { readFile, writeFile } from './file.ts'
import config from '#constants'

export default async function scoutProjects() {
    const projects = await readFile({ file: 'vulnerabilities', data: config.vulnerabilities }) as NotifiedVulnerabilities
    const startTimeRaw = new Date()
    const startTime = startTimeRaw.toLocaleString('nb-NO', {
        timeZone: 'Europe/Oslo'
    })

    console.log(`🐝 Started scouting projects at ${startTime}...`)

    const repositories = execSync("ls -d ../*/")
        .toString()
        .trim()
        .split("\n")
        .map(p => p.replace("../", "")
        .replace("/", ""))

    const vulnerabilities = await scoutRepositories(repositories)
    const critical = []
    const high = []
    const medium = []

    for (const vulnerability of vulnerabilities) {
        if (vulnerability.vulnerabilities.critical > 0) {
            critical.push({
                name: vulnerability.repository,
                details: vulnerability.vulnerabilities
            })

            continue
        }

        if (vulnerability.vulnerabilities.high > 0) {
            high.push({
                name: vulnerability.repository,
                details: vulnerability.vulnerabilities
            })

            continue
        }

        if (vulnerability.vulnerabilities.moderate > 0) {
            medium.push({
                name: vulnerability.repository,
                details: vulnerability.vulnerabilities
            })

            continue
        }
    }

    let finalReport = {
        title: '🐝 Vulnerability Report 🐝',
        description: '',
        highestSeverity: 'medium' as Severity
    }

    let vulnerabilitiesToReport = false

    critical.forEach((repository) => {
        if (!projects.critical.some((r) => r.name === repository.name && r.count <= repository.details.critical)) {
            vulnerabilitiesToReport = true
            finalReport.highestSeverity = 'critical'
            const criticalCount = repository.details.critical
            const highCount = repository.details.high
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const criticalText = `\nCritical: ${criticalCount}`
            const highText = highCount > 0 ? `, High: ${highCount}` : ''
            const mediumText = mediumCount > 0 ? `, Medium: ${mediumCount}` : ''
            finalReport.description += repositoryName + criticalText + highText + mediumText + '.\n'

            projects.critical.push({
                name: repository.name,
                count: repository.details.critical,
                time: new Date().getTime()
            })
        }
    })

    high.forEach((repository) => {
        if (!projects.high.some((r) => r.name === repository.name && r.count <= repository.details.high)) {
            vulnerabilitiesToReport = true
            if (finalReport.highestSeverity === 'medium') {
                finalReport.highestSeverity = 'high'
            }

            const highCount = repository.details.high
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const highText = `\nHigh: ${highCount}`
            const mediumText = mediumCount > 0 ? `, Medium: ${mediumCount}` : ''
            finalReport.description += repositoryName + highText + mediumText + '.\n'

            projects.high.push({
                name: repository.name,
                count: repository.details.high,
                time: new Date().getTime()
            })
        }
    })

    medium.forEach((repository) => {
        if (!projects.medium.some((r) => r.name === repository.name && r.count <= repository.details.moderate)) {
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const mediumText = `\nMedium: ${mediumCount}`
            finalReport.description += repositoryName + mediumText + '.\n'

            projects.medium.push({
                name: repository.name,
                count: repository.details.moderate,
                time: new Date().getTime()
            })
        }
    })

    if (vulnerabilitiesToReport) {
        finalReport.description += '\n'
        if (critical.length > 0) {
            finalReport.description += `Critical vulnerabilities should be patched immediately.\n`
        }

        if (high.length > 0) {
            finalReport.description += `High vulnerabilities should be prioritized.\n`
        }

        if (medium.length > 0) {
            finalReport.description += `Medium vulnerabilities should be patched when possible.\n`
        }

        alert(finalReport)
    }

    const now = new Date().getTime()
    for (const level of ['critical', 'high', 'medium'] as const) {
        projects[level] = projects[level].filter(n => (now - new Date(n.time).getTime()) < config.oneDay)
    }

    writeFile({ file: 'vulnerabilities', content: projects })
    console.log('🐝 Updated notified vulnerabilities:', Object.values(projects).map(arr => arr.length))

    const stoppedTimeRaw = new Date()
    const stoppedTime = stoppedTimeRaw.toLocaleString('nb-NO', {
        timeZone: 'Europe/Oslo',
    })

    const duration = (stoppedTimeRaw.getTime() - startTimeRaw.getTime()) / 1000
    console.log(`🐝 Finished scouting projects at ${stoppedTime} (${duration}s)...`)
}
