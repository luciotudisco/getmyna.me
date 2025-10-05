# Metadata Implementation

This document describes the comprehensive metadata implementation for GetMyNa.me to provide richer previews across social media platforms and search engines.

## Features Implemented

### 1. Metadata Base
- **metadataBase**: Set to `https://getmyna.me` for absolute URL resolution
- Ensures all relative URLs in metadata are properly resolved

### 2. Open Graph Metadata
- **Type**: Website
- **Locale**: en_US
- **Site Name**: GetMyNa.me
- **Title**: Dynamic with template support
- **Description**: SEO-optimized descriptions
- **Images**: Custom Open Graph images (1200x630)
- **URL**: Canonical URLs for each page

### 3. Twitter Cards
- **Card Type**: summary_large_image
- **Site**: @getmyname
- **Creator**: @getmyname
- **Images**: Custom Twitter card images
- **Title & Description**: Optimized for Twitter

### 4. Canonical URLs
- **Homepage**: https://getmyna.me
- **Search**: https://getmyna.me/search
- **About**: https://getmyna.me/about
- Prevents duplicate content issues

### 5. Icons & Favicons
- **SVG Favicon**: Modern, scalable favicon
- **PNG Icons**: Multiple sizes (16x16, 32x32, 180x180, 192x192, 512x512)
- **Apple Touch Icon**: iOS home screen icon
- **Safari Pinned Tab**: Custom Safari tab icon
- **Web App Manifest**: PWA support

### 6. SEO Optimization
- **Keywords**: Domain hack, domain names, creative domains, etc.
- **Robots**: Optimized for search engine crawling
- **Google Bot**: Enhanced crawling instructions
- **Format Detection**: Disabled for email/phone/address

## Files Created/Modified

### Core Metadata
- `src/app/layout.tsx` - Root layout with comprehensive metadata
- `src/app/page.tsx` - Homepage metadata
- `src/app/search/page.tsx` - Search page metadata
- `src/app/about/page.tsx` - About page metadata

### Icons & Images
- `public/favicon.svg` - Modern SVG favicon
- `public/safari-pinned-tab.svg` - Safari pinned tab icon
- `public/og-image.svg` - Open Graph image (1200x630)
- `public/twitter-image.svg` - Twitter card image (1200x600)
- `public/site.webmanifest` - Web app manifest

### Utilities
- `scripts/generate-icons.js` - Script to generate PNG icons from SVG

## Usage

### Generate PNG Icons
```bash
# Install sharp if not already installed
npm install --save-dev sharp

# Generate PNG icons from SVG
node scripts/generate-icons.js
```

### Testing Metadata
1. **Open Graph**: Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. **Twitter Cards**: Test with [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. **Google**: Use [Google Rich Results Test](https://search.google.com/test/rich-results)

## Customization

### Update Brand Colors
The metadata uses the brand colors from the logo:
- Primary: #3a86ff (blue)
- Secondary: #8338ec (purple)
- Accent: #ff006e (pink)

### Update Social Media Handles
Update the Twitter handles in `layout.tsx`:
```typescript
twitter: {
    site: '@yourhandle',
    creator: '@yourhandle',
    // ...
}
```

### Add More Pages
For new pages, add metadata export:
```typescript
export const metadata: Metadata = {
    title: 'Page Title',
    description: 'Page description',
    openGraph: {
        title: 'Page Title | GetMyNa.me',
        description: 'Page description',
        url: 'https://getmyna.me/page',
    },
    // ...
};
```

## Benefits

1. **Better Social Sharing**: Rich previews on Facebook, Twitter, LinkedIn
2. **Improved SEO**: Better search engine understanding and ranking
3. **Professional Appearance**: Consistent branding across platforms
4. **PWA Support**: Web app manifest for installable experience
5. **Mobile Optimization**: Proper icons for mobile devices
6. **Canonical URLs**: Prevents duplicate content issues