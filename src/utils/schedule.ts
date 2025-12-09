export default function schedule(fn: () => void, min = 30) {
    const now = new Date()

    const next = new Date(now)
    next.setSeconds(0, 0)

    const remainder = next.getMinutes() % min
    if (remainder !== 0 || now.getSeconds() !== 0 || now.getMilliseconds() !== 0) {
        next.setMinutes(next.getMinutes() + (min - remainder || min))
    }

    const delay = next.getTime() - now.getTime()

    setTimeout(() => {
        fn()
        setInterval(fn, min * 60 * 1000)
    }, delay)
}
