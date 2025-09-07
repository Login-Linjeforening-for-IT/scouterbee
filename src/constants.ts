import dotenv from 'dotenv'

dotenv.config()

const requiredEnvironmentVariables = [
    'ONEPASSWORD_TOKEN',
    'GITLAB_TOKEN',
    'WEBHOOK_URL',
    'HEARTBEAT_URL',
    'CRITICAL_ROLE'
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

export const notified = {
    critical: [],
    high: [],
    medium: []
} as Notified

const config = {
    ONEPASSWORD_TOKEN: env.ONEPASSWORD_TOKEN,
    GITLAB_URL: 'https://gitlab.login.no/api/v4',
    GITLAB_TOKEN: env.GITLAB_TOKEN,
    WEBHOOK_URL: env.WEBHOOK_URL,
    TEKKOM_GROUP_ID: 5,
    HEARTBEAT_URL: env.HEARTBEAT_URL,
    CRITICAL_ROLE: env.CRITICAL_ROLE
}

export default config
