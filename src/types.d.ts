type Vulnerability = {
    repository: string
    folder: string
    summary: string
    vulnerabilities: {
        info: number
        low: number
        moderate: number
        high: number
        critical: number
    }
}

type NotifiedVulnerabilities = {
    critical: VulnerabilityIdentifier[]
    high: VulnerabilityIdentifier[]
    medium: VulnerabilityIdentifier[]
}

type NotifiedSecrets = {
    hasExpired: Expires[]
    expiresNextWeek: Expires[]
    expiresNextMonth: Expires[]
}

type Severity = 'critical' | 'high' | 'medium'

type VulnerabilityIdentifier = {
    name: string
    count: number
    time: number
}

type Vault = {
    id: string
    name: string
    content_version: number
    created_at: string
    updated_at: string
    items: number
}

type Item = {
    id: string
    title: string
    version: number
    vault: { id: string, name: string },
    category: string
    last_edited_by: string
    created_at: string
    updated_at: string
    additional_information: string
}

type ItemDetail = {
    id: string
    title: string
    version: number
    vault: { id: string, name: string }
    category: string
    last_edited_by: string
    created_at: string
    updated_at: string
    fields: ItemDetailField[]
}

type ItemDetailField = {
    id: string
    type: string
    label: string
    value: string
    reference: string
}

type TokensWithExpire = {
    vault: string
    item: string
    fields: ItemDetailField[]
}

type Expires = {
    vault: string
    title: string
    time: string
    seen: number
}

type ExpiresAlert = {
    hasExpired: Expires[]
    expiresNextWeek: Expires[]
    expiresNextMonth: Expires[]
}
