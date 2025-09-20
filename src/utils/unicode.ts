import { direction } from 'direction';

/**
 * Text direction.
 */
export enum TextDirection {
    LTR = 'LTR',
    RTL = 'RTL',
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
    return detectedDirection === 'rtl' ? TextDirection.RTL : TextDirection.LTR;
}
