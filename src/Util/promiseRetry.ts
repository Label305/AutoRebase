export async function promiseRetry<T>(
    fun: (attemptNumber: number) => Promise<T>,
    config: {timeoutMs: number} = {timeoutMs: 500},
    attemptNumber = 1,
): Promise<T> {
    try {
        return await fun(attemptNumber);
    } catch (e) {
        if (attemptNumber === 10) {
            throw e;
        }
        await timeout(config.timeoutMs);
        return promiseRetry(fun, config, attemptNumber + 1);
    }
}

function timeout(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}
