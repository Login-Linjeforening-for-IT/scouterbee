import dotenv from 'dotenv'

dotenv.config()

const requiredEnvironmentVariables = [
    'ONEPASSWORD_TOKEN',
    'WEBHOOK_URL',
    'HEARTBEAT_URL',
    'CRITICAL_ROLE_DEV',
    'CRITICAL_ROLE_INFRA'
]

const missingVariables = requiredEnvironmentVariables.filter(
    (key) => !process.env[key]
)

if (missingVariables.length > 0) {
    throw new Error(
        'Missing essential environment variables:\n' +
        missingVariables
            .map((key) => `${key}: ${process.env[key] || 'undefined'}`)
            .join('\n')
    )
}

const env = Object.fromEntries(
    requiredEnvironmentVariables.map((key) => [key, process.env[key]])
)

const config = {
    ONEPASSWORD_TOKEN: env.ONEPASSWORD_TOKEN,
    WEBHOOK_URL: env.WEBHOOK_URL,
    TEKKOM_GROUP_ID: 5,
    HEARTBEAT_URL: env.HEARTBEAT_URL,
    CRITICAL_ROLE_DEV: env.CRITICAL_ROLE_DEV,
    CRITICAL_ROLE_INFRA: env.CRITICAL_ROLE_INFRA,
    SECRETS_FILE: 'data/secrets.json',
    VULNERABILITIES_FILE: 'data/vulnerabilities.json',
    secrets: {
        hasExpired: [],
        expiresNextWeek: [],
        expiresNextMonth: []
    },
    vulnerabilities: {
        critical: [],
        high: [],
        medium: []
    },
    oneDay: 24 * 60 * 60 * 1000
}

export default config
