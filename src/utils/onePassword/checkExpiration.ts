import prepareReport from "./prepareReport"

const oneWeek = 7 * 24 * 60 * 60 * 1000
const oneMonth = 30 * 24 * 60 * 60 * 1000

export default async function checkExpiration(notifiedSecrets: NotifiedSecrets, tokensWithExpire: TokensWithExpire[]) {
    const now = new Date().getTime()
    const newNotifiedSecrets = {
        hasExpired: [],
        expiresNextWeek: [],
        expiresNextMonth: []
    } as NotifiedSecrets

    const ranges: [keyof ExpiresAlert, (diff: number) => boolean][] = [
        ["hasExpired", (diff) => diff < 0],
        ["expiresNextWeek", (diff) => diff >= 0 && diff <= oneWeek],
        ["expiresNextMonth", (diff) => diff > oneWeek && diff <= oneMonth],
    ]

    for (const token of tokensWithExpire) {
        for (const field of token.fields) {
            if (field.type.toLowerCase() === 'date') {
                const fieldDateTime = convertToDateTime(field.value)
                const diff = fieldDateTime - now

                for (const [category, check] of ranges) {
                    if (check(diff)) {
                        const newItem: Expires = {
                            vault: token.vault,
                            title: token.item,
                            time: new Date(fieldDateTime).toLocaleString("nb-NO", {
                                timeZone: "Europe/Oslo",
                            }),
                            seen: now,
                        }

                        const alreadyInCategory = notifiedSecrets[category]?.some(
                            (n) =>
                                n.vault === newItem.vault &&
                                n.title === newItem.title
                        )

                        if (alreadyInCategory) {
                            break
                        }

                        // Checks if the secret should be moved to a new category
                        for (const otherCategory of Object.keys(notifiedSecrets) as (keyof ExpiresAlert)[]) {
                            if (otherCategory !== category) {
                                const found = notifiedSecrets[otherCategory]?.find(
                                    (n) =>
                                        n.vault === newItem.vault &&
                                        n.title === newItem.title
                                )

                                if (found) {
                                    // Removes from wrong category
                                    notifiedSecrets[otherCategory] = notifiedSecrets[otherCategory].filter(
                                        (n) => !(n.vault === newItem.vault && n.title === newItem.title)
                                    )

                                    break
                                }
                            }
                        }

                        notifiedSecrets[category].push(newItem)
                        newNotifiedSecrets[category].push(newItem)
                        break
                    }
                }
            }
        }
    }

    const report = prepareReport(newNotifiedSecrets as ExpiresAlert)
    return { categories: notifiedSecrets as ExpiresAlert, data: report }
}

function convertToDateTime(field: string): number {
    return new Date(Number(field) * 1000).getTime()
}
