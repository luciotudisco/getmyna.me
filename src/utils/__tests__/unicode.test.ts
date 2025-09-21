import { direction } from 'direction';

import { getTextDirection, TextDirection } from '@/utils/unicode';

jest.mock('direction');

describe('getTextDirection', () => {
    let mockDirection: jest.MockedFunction<typeof direction>;

    beforeEach(() => {
        mockDirection = direction as jest.MockedFunction<typeof direction>;
        mockDirection.mockClear();
    });

    describe('empty or invalid input', () => {
        it('should return LTR for empty string', () => {
            const result = getTextDirection('');
            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).not.toHaveBeenCalled();
        });

        it('should return LTR for null input', () => {
            const result = getTextDirection(null as any);
            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).not.toHaveBeenCalled();
        });

        it('should return LTR for undefined input', () => {
            const result = getTextDirection(undefined as any);
            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).not.toHaveBeenCalled();
        });
    });

    describe('LTR text detection', () => {
        it('should return LTR when direction library returns "ltr"', () => {
            mockDirection.mockReturnValue('ltr');

            const result = getTextDirection('Hello World');

            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).toHaveBeenCalledWith('Hello World');
            expect(mockDirection).toHaveBeenCalledTimes(1);
        });

        it('should return LTR when direction library returns any non-rtl value', () => {
            mockDirection.mockReturnValue('neutral');

            const result = getTextDirection('123 456');

            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).toHaveBeenCalledWith('123 456');
        });

        it('should return LTR when direction library returns undefined', () => {
            mockDirection.mockReturnValue(undefined as any);

            const result = getTextDirection('Some text');

            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).toHaveBeenCalledWith('Some text');
        });

        it('should return LTR when direction library returns null', () => {
            mockDirection.mockReturnValue(null as any);

            const result = getTextDirection('Some text');

            expect(result).toBe(TextDirection.LTR);
            expect(mockDirection).toHaveBeenCalledWith('Some text');
        });
    });

    describe('RTL text detection', () => {
        it('should return RTL when direction library returns "rtl"', () => {
            mockDirection.mockReturnValue('rtl');

            const result = getTextDirection('مرحبا بالعالم');

            expect(result).toBe(TextDirection.RTL);
            expect(mockDirection).toHaveBeenCalledWith('مرحبا بالعالم');
            expect(mockDirection).toHaveBeenCalledTimes(1);
        });
    });
});
