import { RateLimiter } from '@/utils/rate-limiter';

describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('add', () => {
        beforeEach(() => {
            rateLimiter = new RateLimiter(2); // 2 calls per second (500ms delay)
        });

        it('should execute a single task immediately', async () => {
            const mockTask = jest.fn().mockResolvedValue('result');

            const promise = rateLimiter.add(mockTask);

            // Process timers to allow the task to execute
            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result).toBe('result');
            expect(mockTask).toHaveBeenCalledTimes(1);
        });

        it('should return the correct result from the task', async () => {
            const expectedResult = { data: 'test', id: 123 };
            const mockTask = jest.fn().mockResolvedValue(expectedResult);

            const promise = rateLimiter.add(mockTask);
            await jest.runAllTimersAsync();

            const result = await promise;
            expect(result).toEqual(expectedResult);
        });

        it('should handle task errors correctly', async () => {
            const mockTask = jest.fn().mockRejectedValue(new Error('Task failed'));

            const promise = rateLimiter.add(mockTask);
            await jest.runAllTimersAsync();

            await expect(promise).rejects.toThrow('Task failed');
        });

        it('should execute multiple tasks in order', async () => {
            const results: string[] = [];
            const task1 = jest.fn().mockImplementation(async () => {
                results.push('task1');
                return 'result1';
            });
            const task2 = jest.fn().mockImplementation(async () => {
                results.push('task2');
                return 'result2';
            });
            const task3 = jest.fn().mockImplementation(async () => {
                results.push('task3');
                return 'result3';
            });

            const promise1 = rateLimiter.add(task1);
            const promise2 = rateLimiter.add(task2);
            const promise3 = rateLimiter.add(task3);

            await jest.runAllTimersAsync();

            const [result1, result2, result3] = await Promise.all([promise1, promise2, promise3]);

            expect(results).toEqual(['task1', 'task2', 'task3']);
            expect(result1).toBe('result1');
            expect(result2).toBe('result2');
            expect(result3).toBe('result3');
        });

        it('should respect rate limiting between tasks', async () => {
            const timestamps: number[] = [];
            const startTime = Date.now();
            const createTask = (id: string) =>
                jest.fn().mockImplementation(async () => {
                    timestamps.push(Date.now() - startTime);
                    return id;
                });

            const task1 = createTask('1');
            const task2 = createTask('2');
            const task3 = createTask('3');

            // Add tasks
            const promise1 = rateLimiter.add(task1);
            const promise2 = rateLimiter.add(task2);
            const promise3 = rateLimiter.add(task3);

            // Run all timers to completion
            await jest.runAllTimersAsync();
            await Promise.all([promise1, promise2, promise3]);

            // Verify tasks were executed with proper delays
            expect(timestamps).toHaveLength(3);

            // First task should execute immediately (or near immediately)
            expect(timestamps[0]).toBeLessThanOrEqual(10);

            // Second task should be delayed by ~500ms
            expect(timestamps[1]).toBeGreaterThanOrEqual(500);

            // Third task should be delayed by ~1000ms from start
            expect(timestamps[2]).toBeGreaterThanOrEqual(1000);
        });
    });

    describe('rate limiting behavior', () => {
        it('should enforce 1 call per second rate limit', async () => {
            rateLimiter = new RateLimiter(1); // 1 call per second
            const timestamps: number[] = [];
            const startTime = Date.now();

            const createTask = () =>
                jest.fn().mockImplementation(async () => {
                    timestamps.push(Date.now() - startTime);
                    return 'done';
                });

            const promises = [
                rateLimiter.add(createTask()),
                rateLimiter.add(createTask()),
                rateLimiter.add(createTask()),
            ];

            await jest.runAllTimersAsync();
            await Promise.all(promises);

            expect(timestamps).toHaveLength(3);
            expect(timestamps[0]).toBeLessThanOrEqual(10);
            expect(timestamps[1]).toBeGreaterThanOrEqual(1000);
            expect(timestamps[2]).toBeGreaterThanOrEqual(2000);
        });
    });
});
