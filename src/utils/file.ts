import config from '#constants'
import fs, { promises } from 'fs'

type writeFileProps = {
    file: string
    content: any
    removeBrackets?: boolean
}

type createPath = {
    path: string
}

type createFileOrFolderProps = {
    entry: string
    data: object
}

/**
 * Fetches interval files 
 *
 * @param {string} arg Time interval for the specified file
 * 
 * @returns            Contents of given file
 */
export async function readFile({ file, data }: { file: string, data: object }): Promise<unknown> {
    const File = file === 'secrets' ? config.SECRETS_FILE : config.VULNERABILITIES_FILE
    await createPath({ file, data })

    return new Promise((res) => {
        fs.readFile(File, async (error, data) => {
            if (error) {
                if (error?.errno === -2) {
                    createPath({ file, data })

                    const content = JSON.parse(data.toString())
                    if (content) res(content)
                }

                console.log(JSON.stringify(error))
            }

            try {
                const content = JSON.parse(data.toString())

                if (content) {
                    res(content)
                } else {
                    console.log(JSON.stringify(error))
                }
            } catch (error) {
                console.log(JSON.stringify(error))
            }
        })
    })
}

/**
 * Writes content to file
 * 
 * @param fileName       Filename to write to
 * @param content        Content to write to file
 * 
 * @see handleError(...) Notifies the maintenance team of any error
 * @see file(...)        Returns full file path of given argument
 */
export function writeFile({ file, content, removeBrackets }: writeFileProps) {
    const File = file === 'secrets' ? config.SECRETS_FILE : config.VULNERABILITIES_FILE
    let stringifiedContent = content ? JSON.stringify(content) : '{}'

    if (removeBrackets) {
        stringifiedContent = content
    }

    fs.writeFile(File, stringifiedContent, (error) => {
        if (error) {
            console.error(`Error writing data to 'data/notified.json'`)
            console.log(error)
        }

        console.log(`Saved data to file '${File}'.`)
    })
}

export async function createPath({ file, data }: { file: string, data: object }) {
    const cwd = process.cwd()
    const fullPath = `${cwd}/${file === 'secrets' ? config.SECRETS_FILE : config.VULNERABILITIES_FILE}`
    const entries = fullPath.split('/')
    let currentPath = ''

    for (let i = 1; i < entries.length; i++) {
        currentPath += `/${entries[i]}`
        try {
            await createFileOrFolder({ entry: currentPath, data })
        } catch (error) {
            console.error(`Failed to create entry ${currentPath}:`, error)
            return
        }
    }
}

async function createFileOrFolder({ entry, data }: createFileOrFolderProps) {
    try {
        if (entry.includes('.')) {
            try {
                await promises.access(entry)
            } catch (error) {
                await promises.writeFile(entry, data ? JSON.stringify(data) : '{}')
                console.log(`🐝 File created: ${entry}`)
            }
        } else {
            try {
                await promises.access(entry)
            } catch (error) {
                await promises.mkdir(entry, { recursive: true })
                console.log(`Folder created: ${entry}`)
            }
        }
    } catch (error) {
        throw new Error(`Failed to create ${entry}: ${error}`)
    }
}
