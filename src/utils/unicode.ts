import { direction } from 'direction';

/**
 * Text direction enumeration
 */
export enum TextDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

/**
 * Unicode utility class for text direction detection
 * Uses the lightweight 'direction' library for accurate detection
 */
export class Unicode {
  /**
   * Detects if a Unicode string is Right-to-Left (RTL) or Left-to-Right (LTR)
   * @param text - The Unicode string to analyze
   * @returns TextDirection enum value indicating the text direction
   */
  static getTextDirection(text: string): TextDirection {
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

}