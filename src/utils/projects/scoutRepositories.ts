import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export default async function scoutRepositories(repositories: string[]) {
    const vulnerabilities: Vulnerability[] = []
    const baseDirectory = path.join(process.cwd(), '..')

    for (const repository of repositories) {
        const repositoryDirectory = path.join(baseDirectory, repository)

        const stack = [repositoryDirectory]
        while (stack.length > 0) {
            const currentDir = stack.pop()!
            const entries = fs.readdirSync(currentDir, { withFileTypes: true })
            let hasPackageJson = false
            let hasPackageLockFileJson = false

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name)
                if (entry.isDirectory()) {
                    if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
                        continue
                    }

                    stack.push(fullPath)
                } else if (entry.isFile() && entry.name === 'package.json') {
                    hasPackageJson = true
                } else if (entry.isFile() && entry.name === 'package-lock.json') {
                    hasPackageLockFileJson = true
                }
            }

            if (hasPackageJson && hasPackageLockFileJson) {
                console.log(`🐝 Running npm audit in ${currentDir} 🐝`)
                let auditData

                try {
                    const auditOutput = execSync('npm audit --json', { cwd: currentDir, stdio: 'pipe' }).toString()
                    auditData = JSON.parse(auditOutput)
                } catch (err: any) {
                    if (err.stdout) {
                        auditData = JSON.parse(err.stdout.toString())
                    } else {
                        console.error(`npm audit failed in ${currentDir}:`, err)
                        continue
                    }
                }

                const { metadata } = auditData
                if (metadata.vulnerabilities && Object.values(metadata.vulnerabilities).some(v => v as any > 0)) {
                    const summary = `Vulnerabilities in ${repository}: ${JSON.stringify(metadata.vulnerabilities)}`
                    vulnerabilities.push({
                        repository: repository,
                        folder: currentDir,
                        summary,
                        vulnerabilities: metadata.vulnerabilities
                    })
                } else {
                    console.log(`🐝 No vulnerabilities found in ${currentDir}`)
                }
            }
        }
    }

    return vulnerabilities
}
