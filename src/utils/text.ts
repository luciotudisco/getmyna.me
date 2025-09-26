/**
 * Strips bidirectional text indicators and other problematic Unicode characters
 * that can cause rendering issues in text display.
 */
export function stripBidiIndicators(text: string): string {
    return (
        text
            // Remove Left-to-Right Mark (LRM) - U+200E
            .replace(/\u200E/g, '')
            // Remove Right-to-Left Mark (RLM) - U+200F
            .replace(/\u200F/g, '')
            // Remove Left-to-Right Embedding (LRE) - U+202A
            .replace(/\u202A/g, '')
            // Remove Right-to-Left Embedding (RLE) - U+202B
            .replace(/\u202B/g, '')
            // Remove Pop Directional Formatting (PDF) - U+202C
            .replace(/\u202C/g, '')
            // Remove Left-to-Right Override (LRO) - U+202D
            .replace(/\u202D/g, '')
            // Remove Right-to-Left Override (RLO) - U+202E
            .replace(/\u202E/g, '')
            // Remove Left-to-Right Isolate (LRI) - U+2066
            .replace(/\u2066/g, '')
            // Remove Right-to-Left Isolate (RLI) - U+2067
            .replace(/\u2067/g, '')
            // Remove First Strong Isolate (FSI) - U+2068
            .replace(/\u2068/g, '')
            // Remove Pop Directional Isolate (PDI) - U+2069
            .replace(/\u2069/g, '')
            // Remove Zero Width Space (ZWSP) - U+200B
            .replace(/\u200B/g, '')
            // Remove Zero Width Non-Joiner (ZWNJ) - U+200C
            .replace(/\u200C/g, '')
            // Remove Zero Width Joiner (ZWJ) - U+200D
            .replace(/\u200D/g, '')
            // Remove Word Joiner (WJ) - U+2060
            .replace(/\u2060/g, '')
            // Remove other invisible/control characters that might cause issues
            .replace(/[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u3164\uFEFF\uFFA0]/g, '')
    );
}

/**
 * Strips bidi indicators from an array of strings
 */
export function stripBidiIndicatorsFromArray(messages: string[]): string[] {
    return messages.map(stripBidiIndicators);
}
