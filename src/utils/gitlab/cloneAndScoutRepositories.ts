import config from '#constants'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const TOKEN = config.GITLAB_TOKEN

type Repo = {
    id: number
    name: string
    path: string
    defaultBranch: string
}

export default async function cloneAndScoutRepositories(repositories: Repo[]) {
    const vulnerabilities: Vulnerability[] = []
    const baseDirectory = path.join(process.cwd(), 'data')

    if (!fs.existsSync(baseDirectory)) {
        fs.mkdirSync(baseDirectory, { recursive: true })
    }

    for (const repository of repositories) {
        const repositoryDirectory = path.join(baseDirectory, repository.name)
        const cloneUrl = `https://oauth2:${TOKEN}@gitlab.login.no/${repository.path}.git`

        if (!fs.existsSync(repositoryDirectory)) {
            try {
                console.log(`\n🐝 Cloning ${repository.name} 🐝`)
                execSync(`git clone --branch ${repository.defaultBranch} ${cloneUrl} "${repositoryDirectory}"`, { stdio: 'inherit' })
            } catch (err) {
                console.error(`Failed to clone ${repository.name}:`, err)
                continue
            }
        } else {
            console.log(`\n🐝 Updating ${repository.name} 🐝`)
            try {
                execSync(`git fetch --all`, { cwd: repositoryDirectory, stdio: 'inherit' })
                execSync(`git checkout ${repository.defaultBranch}`, { cwd: repositoryDirectory, stdio: 'inherit' })
                execSync(`git pull origin ${repository.defaultBranch}`, { cwd: repositoryDirectory, stdio: 'inherit' })
            } catch (err) {
                console.error(`Failed to update ${repository.name}:`, err)
                continue
            }
        }

        const stack = [repositoryDirectory]
        while (stack.length > 0) {
            const currentDir = stack.pop()!
            const entries = fs.readdirSync(currentDir, { withFileTypes: true })
            let hasPackageJson = false

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name)
                if (entry.isDirectory()) {
                    if (entry.name === "node_modules" || entry.name.startsWith(".")) {
                        continue
                    }

                    stack.push(fullPath)
                } else if (entry.isFile() && entry.name === 'package.json') {
                    hasPackageJson = true
                }
            }

            if (hasPackageJson) {
                console.log(`\n🐝 Running npm install in ${currentDir} 🐝`)
                try {
                    execSync('npm install --legacy-peer-deps --force', { cwd: currentDir, stdio: 'inherit' })
                } catch (err) {
                    console.error(`npm install failed in ${currentDir}:`, err)
                }

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
                    const summary = `Vulnerabilities in ${repository.name}: ${JSON.stringify(metadata.vulnerabilities)}`
                    vulnerabilities.push({
                        repository: repository.name,
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
