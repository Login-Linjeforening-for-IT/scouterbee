import config from "#constants"

const TOKEN = config.GITLAB_TOKEN

export default async function hasPackageJsonAnywhere(projectId: number, defaultBranch: string) {
    const stack = ['']

    while (stack.length > 0) {
        const path = stack.pop()!
        const url = `${config.GITLAB_URL}/projects/${projectId}/repository/tree?ref=${defaultBranch}&path=${encodeURIComponent(path)}&per_page=100`
        const res = await fetch(url, {
            headers: { 'Private-Token': TOKEN ?? '' }
        })

        if (!res.ok) {
            continue
        }

        const items = await res.json()
        for (const item of items) {
            if (item.type === 'tree') {
                stack.push(item.path)
            } else if (item.type === 'blob' && item.name === 'package.json') {
                return true
            }
        }
    }

    return false
}
