import config from '#constants'
import hasPackageJsonAnywhere from './hasPackageJSON.ts'

const GITLAB_URL = config.GITLAB_URL
const TOKEN = config.GITLAB_TOKEN

export default async function getNpmProjects() {
    const groupId = 5
    const perPage = 100
    let page = 1
    let npmProjects: any[] = []

    while (true) {
        const res = await fetch(`${GITLAB_URL}/groups/${groupId}/projects?include_subgroups=true&archived=false&per_page=${perPage}&page=${page}`, {
            headers: { 'Private-Token': TOKEN ?? '' }
        })

        const projects = await res.json() as Project[]
        if (!projects.length) {
            break
        }

        for (const project of projects) {
            const defaultBranch = project.default_branch
            const isNPM = await hasPackageJsonAnywhere(project.id, defaultBranch)

            if (isNPM) {
                npmProjects.push({
                    id: project.id,
                    name: project.name,
                    path: project.path_with_namespace,
                    defaultBranch
                })
            }
        }

        page++
    }

    return npmProjects
}
