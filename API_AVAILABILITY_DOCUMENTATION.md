# Dictionary Availability API

## Overview

This document describes the new API endpoint that retrieves dictionary entries whose last availability check (`lastUpdated`) is older than 60 days, ordered by rank.

## API Endpoint

### GET /api/dictionary/availability

Retrieves dictionary entries from Algolia that haven't been checked for availability in the last 60 days, sorted by rank in ascending order (lower rank numbers first).

### Query Parameters

- `page` (optional, default: `0`) - Page number for pagination
- `hitsPerPage` (optional, default: `100`, max: `1000`) - Number of results per page

### Response Format

```json
{
    "entries": [
        {
            "objectID": "example.com",
            "domain": "example.com",
            "tld": "com",
            "word": "example",
            "category": "common",
            "isAvailable": true,
            "rank": 1,
            "lastUpdated": "2024-10-01T12:00:00.000Z",
            "lastUpdatedTimestamp": 1696161600,
            "locale": "en_US"
        }
    ],
    "pagination": {
        "page": 0,
        "hitsPerPage": 100,
        "nbHits": 150,
        "nbPages": 2
    }
}
```

### Error Response

```json
{
    "error": "Internal server error"
}
```

Status code: `500`

## Usage Examples

### Retrieve first 100 stale entries

```bash
curl http://localhost:3000/api/dictionary/availability
```

### Retrieve with pagination

```bash
curl http://localhost:3000/api/dictionary/availability?page=2&hitsPerPage=50
```

### Production URL

```bash
curl https://www.getmyna.me/api/dictionary/availability
```

## Implementation Details

### Files Modified/Created

1. **`src/app/api/dictionary/availability/route.ts`** - Main API endpoint implementation
2. **`src/app/api/dictionary/availability/__tests__/route.test.ts`** - Test suite for the API
3. **`src/models/dictionary.ts`** - Updated DictionaryEntry interface to include:
    - `rank?: number`
    - `lastUpdated?: string`
    - `lastUpdatedTimestamp?: number`
    - `locale?: string`
4. **`scripts/populate-dictionary.ts`** - Updated to include `lastUpdatedTimestamp` field when creating entries

### How It Works

1. Calculates the timestamp for 60 days ago from the current date
2. Queries Algolia using the `searchForHits` method with filter: `lastUpdatedTimestamp < {timestamp_60_days_ago}`
3. Retrieves all relevant fields for dictionary entries
4. Sorts results by `rank` in ascending order (lower rank = higher priority)
5. Returns paginated results with metadata

### Key Features

- **Timestamp-based filtering**: Uses numeric `lastUpdatedTimestamp` field for efficient Algolia filtering
- **Pagination support**: Handles large result sets with configurable page size (capped at 1000)
- **Rank-based sorting**: Prioritizes entries based on their rank (e.g., common words ranked higher)
- **Error handling**: Gracefully handles errors and returns appropriate error messages
- **Logging**: Logs search operations for monitoring and debugging

## Data Model Changes

### DictionaryEntry Interface

The `DictionaryEntry` interface was extended to include:

```typescript
export interface DictionaryEntry {
    objectID?: string;
    word?: string;
    category?: string;
    domain: string;
    tld: string;
    isAvailable?: boolean;
    rank?: number; // NEW: Entry rank/priority
    lastUpdated?: string; // NEW: ISO 8601 timestamp string
    lastUpdatedTimestamp?: number; // NEW: Unix timestamp in seconds
    locale?: string; // NEW: Language/locale code
}
```

### Populate Dictionary Script

When creating dictionary entries, the script now includes:

```typescript
const now = new Date();
const entry = {
    // ... other fields
    lastUpdated: now.toISOString(),
    lastUpdatedTimestamp: Math.floor(now.getTime() / 1000),
};
```

## Testing

The API endpoint includes comprehensive test coverage:

- ✅ Returns entries older than 60 days ordered by rank
- ✅ Supports pagination parameters
- ✅ Caps hitsPerPage at 1000
- ✅ Handles errors gracefully

Run tests with:

```bash
npm test -- src/app/api/dictionary/availability/__tests__/route.test.ts
```

## Environment Variables Required

- `NEXT_PUBLIC_ALGOLIA_APP_ID` - Algolia application ID
- `ALGOLIA_API_KEY` - Algolia API key (admin/search)
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME` - Name of the Algolia index (e.g., "dictionary")

## Notes

- The `lastUpdatedTimestamp` field must be configured as a numeric attribute in Algolia for filtering to work correctly
- Results are sorted client-side after retrieval. For better performance with large datasets, consider creating an Algolia replica index sorted by rank
- The 60-day threshold is hardcoded in the API. To make it configurable, add a query parameter like `days` or move it to an environment variable
