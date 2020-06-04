import {promiseRetry} from '../promiseRetry';

describe('promiseRetry', () => {
    it('should call the function', async () => {
        /* Given */
        const spy = new Spy();

        /* When */
        await promiseRetry(spy.fun.bind(spy), {timeoutMs: 0});

        /* Then */
        expect(spy.calls).toBe(1);
    });

    it('should call the function twice when first call throws an errors', async () => {
        /* Given */
        const spy = new Spy(1);

        /* When */
        await promiseRetry(spy.fun.bind(spy), {timeoutMs: 0});

        /* Then */
        expect(spy.calls).toBe(2);
    });

    it('should stop calling after 10 tries', async () => {
        /* Given */
        const spy = new Spy(10000);

        /* When */
        try {
            await promiseRetry(spy.fun.bind(spy), {timeoutMs: 0});
        } catch (e) {
            /* Noop */
        }

        /* Then */
        expect(spy.calls).toBe(10);
    });
});

class Spy {
    public calls = 0;

    constructor(public numErrorsToBeThrown = 0) {}

    public fun() {
        this.calls++;

        if (this.numErrorsToBeThrown > 0) {
            this.numErrorsToBeThrown--;
            throw new Error(`Error #${this.numErrorsToBeThrown}`);
        }

        return Promise.resolve();
    }
}
