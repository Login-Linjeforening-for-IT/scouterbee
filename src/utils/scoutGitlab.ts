import getNpmProjects from "./gitlab/getNpmProjects"
import alert from "./gitlab/alert"
import cloneAndScoutRepositories from "./gitlab/cloneAndScoutRepositories"

export default async function scoutGitlab(notifiedVulnerabilities: NotifiedVulnerabilities) {
    console.log("🐝 Scouting Gitlab...")
    const repositories = await getNpmProjects()
    const vulnerabilities = await cloneAndScoutRepositories(repositories)
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
        highestSeverity: 'medium' as Severity
    }

    let vulnerabilitiesToReport = false

    critical.forEach((repository) => {
        if (!notifiedVulnerabilities.critical.some((r) => r.name === repository.name && r.count <= repository.details.critical)) {
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

            notifiedVulnerabilities.critical.push({
                name: repository.name,
                count: repository.details.critical,
                time: new Date().getTime()
            })
        }
    })

    high.forEach((repository) => {
        if (!notifiedVulnerabilities.high.some((r) => r.name === repository.name && r.count <= repository.details.high)) {
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

            notifiedVulnerabilities.high.push({
                name: repository.name,
                count: repository.details.high,
                time: new Date().getTime()
            })
        }
    })

    medium.forEach((repository) => {
        if (!notifiedVulnerabilities.medium.some((r) => r.name === repository.name && r.count <= repository.details.moderate)) {
            const mediumCount = repository.details.moderate
            const repositoryName = `**${repository.name}**`
            const mediumText = `\nMedium: ${mediumCount}`
            finalReport.description += repositoryName + mediumText + '.\n'

            notifiedVulnerabilities.medium.push({
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

    return notifiedVulnerabilities
}
