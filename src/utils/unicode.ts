import { direction } from 'direction';

/**
 * Text direction enumeration
 */
export enum TextDirection {
  LTR = 'ltr',
  RTL = 'rtl',
  NEUTRAL = 'neutral'
}

/**
 * Unicode utility class for text direction detection
 * Uses the lightweight 'direction' library for accurate detection
 */
export class Unicode {
  /**
   * Detects if a Unicode string is Right-to-Left (RTL), Left-to-Right (LTR), or Neutral
   * @param text - The Unicode string to analyze
   * @returns TextDirection enum value indicating the text direction
   */
  static getTextDirection(text: string): TextDirection {
    if (!text || text.length === 0) {
      return TextDirection.LTR;
    }

    const detectedDirection = direction(text);
    
    switch (detectedDirection) {
      case 'rtl':
        return TextDirection.RTL;
      case 'ltr':
        return TextDirection.LTR;
      case 'neutral':
      default:
        return TextDirection.NEUTRAL;
    }
  }

  /**
   * Checks if the text is RTL
   * @param text - The Unicode string to check
   * @returns true if RTL, false otherwise
   */
  static isRTL(text: string): boolean {
    return this.getTextDirection(text) === TextDirection.RTL;
  }

  /**
   * Checks if the text is LTR
   * @param text - The Unicode string to check
   * @returns true if LTR, false otherwise
   */
  static isLTR(text: string): boolean {
    return this.getTextDirection(text) === TextDirection.LTR;
  }

  /**
   * Checks if the text is neutral (numbers, symbols, etc.)
   * @param text - The Unicode string to check
   * @returns true if neutral, false otherwise
   */
  static isNeutral(text: string): boolean {
    return this.getTextDirection(text) === TextDirection.NEUTRAL;
  }
}