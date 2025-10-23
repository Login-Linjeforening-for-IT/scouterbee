import { exec } from 'child_process'
import checkExpiration from './onePassword/checkExpiration.ts'
import alertExpired from './onePassword/alertExpired.ts'

const ONEPASSWORD_TOKEN = process.env.ONEPASSWORD_TOKEN

export default async function scoutOnePassword(notifiedSecrets: NotifiedSecrets) {
    console.log('🐝 Scouting 1Password...')

    try {
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

        const { categories, data } = await checkExpiration(notifiedSecrets, tokensWithExpire)
        if (data.secretsToReport) {
            await alertExpired(data.ping, data.red, data.finalReport)
        }

        return categories
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
