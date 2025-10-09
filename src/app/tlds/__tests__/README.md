# TLDs Page Tests

This directory contains comprehensive unit tests for the TLDs page component (`/src/app/tlds/page.tsx`).

## Test Coverage

The test suite covers the following scenarios:

### Loading State

- Shows loading message when TLDs are being fetched
- Shows loading message when TLDs array is empty

### Error State

- Shows error message when API call fails
- Does not show TLDs content when there is an error

### Success State

- Renders TLDs page with correct title and badge
- Displays the correct count of TLDs in the description
- Renders all TLDs as badges
- Uses the correct key for TLD badges (name or punycodeName)
- Renders TLD badges with outline variant
- Has proper responsive layout classes
- Has proper container classes for TLD badges

### API Integration

- Calls getTLDs API on component mount
- Handles API response correctly

### Edge Cases

- Handles TLDs with missing name property
- Handles TLDs with missing punycodeName property
- Handles TLDs with both name and punycodeName
- Handles empty TLDs array by showing loading state
- Handles TLDs with undefined name and punycodeName

### Accessibility

- Has proper heading structure
- Has proper main landmark

### Performance

- Uses useTransition for state updates

## Running Tests

```bash
# Run all tests
npm test

# Run only TLDs page tests
npm test src/app/tlds/__tests__/page.test.tsx

# Run tests in watch mode
npm run test:watch
```

## Mocked Components

The following components are mocked to simplify testing:

- `ErrorMessage` - Mocked to return a simple div with test ID
- `LoadingMessage` - Mocked to return a simple div with test ID
- `Highlighter` - Mocked to return a simple span wrapper
- `apiClient` - Mocked to control API responses

## Test Data

The tests use mock TLD data that includes:

- Standard TLDs (com, org, uk)
- Internationalized TLDs (москва with punycode)
- Various TLD types (GENERIC, COUNTRY_CODE)
- Edge cases (missing properties, undefined values)
