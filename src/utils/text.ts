/**
 * Strips bidirectional text indicators and other problematic Unicode characters
 * that can cause rendering issues in text display.
 */
export function stripBidiIndicators(text: string): string {
    return text.replace(
        /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\u2060\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u3164\uFEFF\uFFA0]/g,
        '',
    );
}

/**
 * Strips bidi indicators from an array of strings
 */
export function stripBidiIndicatorsFromArray(messages: string[]): string[] {
    return messages.map(stripBidiIndicators);
}
