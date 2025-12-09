import { exec } from 'child_process'
import checkExpiration from './onePassword/checkExpiration.ts'
import alertExpired from './onePassword/alertExpired.ts'
import { readFile, writeFile } from './file.ts'
import config from '#constants'

const ONEPASSWORD_TOKEN = process.env.ONEPASSWORD_TOKEN

export default async function scoutOnePassword() {
    const startTime = new Date().toLocaleString('nb-NO', {
        timeZone: 'Europe/Oslo'
    })

    console.log(`🐝 Started scouting 1Password at ${startTime}...`)

    try {
        const secrets = await readFile({ file: 'secrets', data: config.secrets }) as NotifiedSecrets
        const vaultsJson = await execCommand(`OP_SERVICE_ACCOUNT_TOKEN=${ONEPASSWORD_TOKEN} op vault list --format json`)
        const vaults = JSON.parse(vaultsJson) as Vault[]
        let tokensWithExpire = [] as TokensWithExpire[]

        console.log('🐝 Found vaults', vaults.map((vault) => vault.name))
        for (const vault of vaults) {
            const itemsJson = await execCommand(`OP_SERVICE_ACCOUNT_TOKEN=${ONEPASSWORD_TOKEN} op item list --vault '${vault.name}' --format json`)
            const items = JSON.parse(itemsJson) as Item[]
            console.log(`🐝 Found ${items.length} items in ${vault.name}`)

            for (const item of items) {
                const itemJson = await execCommand(`OP_SERVICE_ACCOUNT_TOKEN=${ONEPASSWORD_TOKEN} op item get '${item.id}' --vault '${vault.name}' --format json`)
                const itemDetail = JSON.parse(itemJson) as ItemDetail
                const matchingFields = itemDetail.fields.filter(f => f.value?.toLowerCase().includes('expire') || f.reference.toLowerCase().includes('expire'))

                if (matchingFields?.length) {
                    tokensWithExpire.push({
                        vault: vault.name,
                        item: itemDetail.title,
                        fields: matchingFields,
                    })
                }
            }
        }

        const { categories, data } = await checkExpiration(secrets, tokensWithExpire)
        if (data.secretsToReport) {
            await alertExpired(data.ping, data.red, data.finalReport)
        }

        const now = Date.now()
        for (const level of ['hasExpired', 'expiresNextWeek', 'expiresNextMonth'] as const) {
            categories[level] = categories[level].filter(n => (now - n.seen) < config.oneDay)
        }

        writeFile({ file: 'secrets', content: categories })

        const endTime = new Date().toLocaleString('nb-NO', {
            timeZone: 'Europe/Oslo'
        })

        console.log(`🐝 Finished scouting 1Password at ${endTime}...`)
    } catch (err) {
        console.error('Error fetching 1Password data:', err)
        throw err
    }
}

function execCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, _) => {
            if (error) {
                return reject(error)
            }

            resolve(stdout)
        })
    })
}
