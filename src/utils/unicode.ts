/**
 * Text direction enumeration
 */
export enum TextDirection {
  LTR = 'ltr',
  RTL = 'rtl'
}

/**
 * Unicode utility class for text direction detection
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

    // RTL Unicode ranges
    const rtlRanges = [
      [0x0590, 0x05FF], // Hebrew
      [0x0600, 0x06FF], // Arabic
      [0x0750, 0x077F], // Arabic Supplement
      [0x08A0, 0x08FF], // Arabic Extended-A
      [0xFB1D, 0xFDFF], // Arabic Presentation Forms-A
      [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
      [0x10800, 0x10FFF], // Phoenician, Lydian, etc.
      [0x1E800, 0x1E8DF], // Mende Kikakui
      [0x1EE00, 0x1EEFF], // Arabic Mathematical Alphabetic Symbols
    ];

    // Count RTL characters
    let rtlCount = 0;
    let ltrCount = 0;

    for (const char of text) {
      const codePoint = char.codePointAt(0);
      if (!codePoint) continue;

      // Check if character is in RTL range
      let isRTL = false;
      for (const [start, end] of rtlRanges) {
        if (codePoint >= start && codePoint <= end) {
          isRTL = true;
          break;
        }
      }

      if (isRTL) {
        rtlCount++;
      } else {
        // Check if it's a visible character (not whitespace, punctuation, numbers)
        if (/\p{L}/u.test(char)) {
          ltrCount++;
        }
      }
    }

    // Determine direction based on majority of directional characters
    return rtlCount > ltrCount ? TextDirection.RTL : TextDirection.LTR;
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