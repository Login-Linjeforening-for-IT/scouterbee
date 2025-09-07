import { notified } from "@constants"
import { cloneAndCheckRepos } from "./gitlab/cloneAndCheckRepos"
import getNpmProjects from "./gitlab/getNpmProjects"
import alert from "./gitlab/alert"

export default async function checkGitlab() {
    console.log("🐝 Scouting Gitlab...")
    const repositories = await getNpmProjects()
    const vulnerabilities = await cloneAndCheckRepos(repositories)
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
        title: "🐝 Vulnerability Report 🐝",
        description: '',
        highestSeverity: 'none' as Severity
    }

    critical.forEach((repository) => {
        if (!notified.critical.some((r) => r.name === repository.name && r.count <= repository.details.critical)) {
            finalReport.highestSeverity = 'critical'
            const criticalCount = repository.details.critical
            const highCount = repository.details.high
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const criticalText = `\nCritical: ${criticalCount}`
            const highText = highCount > 0 ? `, High: ${highCount}` : ''
            const mediumText = mediumCount > 0 ? `, Medium: ${mediumCount}` : ''
            const repositoryText = `. Critical vulnerabilities should be patched immediately.`
            finalReport.description += repositoryName + criticalText + highText + mediumText + repositoryText
            notified.critical.push({
                name: repository.name,
                count: repository.details.critical,
                time: new Date().getTime()
            })
        }
    })

    high.forEach((repository) => {
        if (!notified.high.some((r) => r.name === repository.name && r.count <= repository.details.high)) {
            if (finalReport.highestSeverity === 'none') {
                finalReport.highestSeverity = 'high'
            }

            const highCount = repository.details.high
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const highText = `\nHigh: ${highCount}`
            const mediumText = mediumCount > 0 ? `, Medium: ${mediumCount}` : ''
            const repositoryText = `. High vulnerabilities should be prioritized.`
            finalReport.description += repositoryName + highText + mediumText + repositoryText
            notified.high.push({
                name: repository.name,
                count: repository.details.high,
                time: new Date().getTime()
            })
        }
    })

    medium.forEach((repository) => {
        if (!notified.high.some((r) => r.name === repository.name && r.count <= repository.details.high)) {
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const mediumText = `\nMedium: ${mediumCount}`
            const repositoryText = `. Medium vulnerabilities should be patched when possible.`
            finalReport.description += repositoryName + mediumText + repositoryText
            notified.medium.push({
                name: repository.name,
                count: repository.details.moderate,
                time: new Date().getTime()
            })
        }
    })

    if (critical.length > 0 || high.length > 0) {
        alert(finalReport)
    }
}
