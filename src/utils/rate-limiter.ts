/**
 * A rate limiter that limits the number of calls per second.
 */
export class RateLimiter {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastCallTime = 0;
    private delayMs: number;

    constructor(callsPerSecond: number) {
        this.delayMs = 1000 / callsPerSecond;
    }

    /**
     * Adds a task to the queue.
     * 
     * Tasks are executed in the order they are added ensuring the given rate is not exceeded.
     * 
     * @param task - The task to add to the queue.
     * @returns The result of the task.
     */
    async add<T>(task: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.process();
        });
    }
    private async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLastCall = now - this.lastCallTime;
            const delay = Math.max(0, this.delayMs - timeSinceLastCall);

            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            const task = this.queue.shift();
            if (task) {
                this.lastCallTime = Date.now();
                await task();
            }
        }

        this.processing = false;
    }
}
