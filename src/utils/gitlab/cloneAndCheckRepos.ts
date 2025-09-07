import config from '@constants'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const TOKEN = config.GITLAB_TOKEN

type Repo = {
    id: number
    name: string
    path: string
    defaultBranch: string
}

export async function cloneAndCheckRepos(repositories: Repo[]) {
    const vulnerabilities: Vulnerability[] = []
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'gitlab-clone-'))

    try {
        for (const repository of repositories) {
            const repositoryDirectory = path.join(temporaryDirectory, repository.name)
            const cloneUrl = `https://oauth2:${TOKEN}@gitlab.login.no/${repository.path}.git`

            try {
                console.log(`\n🐝 Cloning ${repository.name} 🐝`)
                execSync(`git clone --branch ${repository.defaultBranch} ${cloneUrl} "${repositoryDirectory}"`, { stdio: 'inherit' })
            } catch (err) {
                console.error(`Failed to clone ${repository.name}:`, err)
                // skips to next repository
                continue
            }

            // Recursively search for package.json
            const stack = [repositoryDirectory]
            while (stack.length > 0) {
                const currentDir = stack.pop()!
                const entries = fs.readdirSync(currentDir, { withFileTypes: true })

                let hasPackageJson = false

                for (const entry of entries) {
                    const fullPath = path.join(currentDir, entry.name)
                    if (entry.isDirectory()) {
                        // traverses subfolder
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
                        continue
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
                        console.log(`No vulnerabilities found in ${currentDir}`)
                    }
                }
            }
        }
    } finally {
        // Deletes the temporary folder once done
        try {
            fs.rmSync(temporaryDirectory, { recursive: true, force: true })
            console.log(`\n🐝 Temp folder ${temporaryDirectory} deleted 🐝`)
        } catch (err) {
            console.error(`Failed to delete temp folder ${temporaryDirectory}:`, err)
        }
    }

    return vulnerabilities
}
