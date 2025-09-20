import { direction } from 'direction';

/**
 * Text direction enumeration
 */
export enum TextDirection {
    LTR = 'ltr',
    RTL = 'rtl',
}

/**
 * Detects if a Unicode string is Right-to-Left (RTL) or Left-to-Right (LTR)
 * @param text - The Unicode string to analyze
 * @returns TextDirection enum value indicating the text direction
 */
export function getTextDirection(text: string): TextDirection {
    if (!text || text.length === 0) {
        return TextDirection.LTR;
    }

    const detectedDirection = direction(text);

    // Default neutral and unknown directions to LTR
    return detectedDirection === 'rtl' ? TextDirection.RTL : TextDirection.LTR;
}

/**
 * Checks if the text is RTL
 * @param text - The Unicode string to check
 * @returns true if RTL, false otherwise
 */
export function isRTL(text: string): boolean {
    return getTextDirection(text) === TextDirection.RTL;
}

/**
 * Checks if the text is LTR
 * @param text - The Unicode string to check
 * @returns true if LTR, false otherwise
 */
export function isLTR(text: string): boolean {
    return getTextDirection(text) === TextDirection.LTR;
}
