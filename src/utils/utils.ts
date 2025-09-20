import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { TextDirection } from '@/models/tld';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Detects the text direction of a string based on Unicode bidirectional properties.
 * This function analyzes the first strong directional character in the string to
 * determine whether the text should be displayed left-to-right (LTR) or right-to-left (RTL).
 * 
 * @param text - The text to analyze
 * @returns The detected text direction (LTR or RTL)
 */
export function detectTextDirection(text: string): TextDirection {
    if (!text) {
        return TextDirection.LEFT_TO_RIGHT;
    }

    // Unicode bidirectional character properties
    const strongLTRChars = /[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u2E00-\u2E7F\u3000-\u309F\u30A0-\u31FF\u32FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const strongRTLChars = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    // Check for strong RTL characters first (Arabic, Hebrew, etc.)
    if (strongRTLChars.test(text)) {
        return TextDirection.RIGHT_TO_LEFT;
    }
    
    // Check for strong LTR characters (Latin, Cyrillic, CJK, etc.)
    if (strongLTRChars.test(text)) {
        return TextDirection.LEFT_TO_RIGHT;
    }
    
    // Default to LTR for neutral characters or mixed content
    return TextDirection.LEFT_TO_RIGHT;
}

/**
 * Determines if a TLD name indicates right-to-left text direction.
 * This function checks both the Unicode representation and punycode representation
 * to determine the appropriate text direction for display purposes.
 * 
 * @param tldName - The TLD name (Unicode)
 * @param punycodeName - The punycode representation of the TLD
 * @returns The detected text direction
 */
export function detectTLDDirection(tldName: string, punycodeName?: string): TextDirection {
    // For IDN TLDs (those with punycode representation), check the Unicode version
    if (punycodeName && punycodeName !== tldName) {
        return detectTextDirection(tldName);
    }
    
    // For ASCII TLDs, check the name directly
    return detectTextDirection(tldName);
}
