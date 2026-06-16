# Link Checker Implementation Guide

## Overview
A new **Link Checker** feature has been added to the admin panel that allows you to check URL status from two sources:
1. **Check Videos JSON** - Check all URLs from `videos.json`
2. **Check File TXT** - Check URLs from an uploaded `.txt` file or pasted text

## Features

### 1. Check Videos JSON Mode
- Displays all videos from `videos.json`
- One-click check to validate all links at once
- Shows live/dead status for each URL
- Real-time progress display

### 2. Check File TXT Mode
- **File Upload**: Upload a `.txt` file with URLs (one per line)
- **Manual Input**: Paste URLs directly into a textarea
- **Custom Domains**: Optional field to specify domain filters (comma-separated)
- Real-time result streaming as URLs are checked

## File Structure

New files created:
```
src/
└── components/
    └── CheckerPage.tsx          # Main checker component
```

Updated files:
```
src/
└── pages/
    └── AdminLinksPage.tsx       # Added tabs for Link Manager and Checker
```

## How to Use

### Accessing the Checker
1. Go to `/admin/links`
2. Click the **"Link Checker"** tab (appears in the header)

### Mode 1: Check Videos JSON
1. Click the **"Cek Videos JSON"** tab
2. Click **"Mulai Pemeriksaan"** button
3. Wait for results to load
4. View statistics (Total, LIVE, DEAD, Health %)
5. Download results as `.txt` file

**Available Downloads:**
- Download Semua (All URLs)
- Download LIVE (Only working URLs)
- Download DEAD (Only broken URLs)

### Mode 2: Check File TXT
1. Click the **"Cek File TXT"** tab
2. Either:
   - Click **"Pilih File"** to upload a `.txt` file
   - Or paste URLs directly in the textarea (one URL per line)
3. Optionally add custom domain filters (comma-separated)
4. Click **"Mulai Pemeriksaan"** button
5. View results with status indicators
6. Download results in various formats

**URL Format Example:**
```
https://cdn.videy.co/eNukFzWp1.mp4
https://cdn2.slicedrive.com/0U7TGpzO1.mp4
https://example.com/video.mp4
```

## Result Display

Each URL result shows:
- **Status Badge**: "LIVE" (green) or "DEAD" (red)
- **Video ID**: Extracted from the URL
- **URL**: The full URL being checked
- **Error Info**: Any error message if the URL failed

### Statistics Dashboard
- **Total Diperiksa**: Number of URLs checked
- **LIVE**: Count of working URLs (percentage shown in color: green)
- **DEAD**: Count of broken URLs (percentage shown in color: red)
- **Kesehatan** (Health): Overall health percentage

## Integration with Existing Services

The checker uses existing services:
- `linkValidator.checkLinkAccess()` - Check individual URL status
- `linkValidator.checkMultipleLinks()` - Check multiple URLs in parallel
- `linkValidator.saveLinkCheckCache()` - Cache results locally

## Key Implementation Details

### CheckerPage Component
- **Mode State**: Toggles between 'videos' and 'file' modes
- **Real-time Results**: Results update as each URL is checked
- **Streaming UX**: Progress feedback during checking
- **Error Handling**: Gracefully handles failed checks with error messages

### Integration with Admin Page
- Tab-based navigation between "Link Manager" and "Link Checker"
- Same authentication/authorization as existing admin page
- Persistent state within each mode

## Example Usage Scenarios

### Scenario 1: Verify all videos are accessible
1. Go to Link Checker
2. Click "Cek Videos JSON"
3. Start checking
4. Download "DEAD" results to identify broken URLs
5. Use results in VideoLinkManager to update or remove broken links

### Scenario 2: Check external URL list
1. Prepare a `.txt` file with URLs
2. Go to Link Checker
3. Click "Cek File TXT"
4. Upload the file
5. Get results and download working/broken URLs

## Technical Notes

- Checker respects CORS policies (uses HEAD/GET requests)
- Timeout: 5 seconds per URL
- Checks both accessibility and content-type validation
- Results are cached locally in browser storage
- File downloads use browser's download mechanism

## Customization

To modify behavior, edit `/src/components/CheckerPage.tsx`:

```typescript
// Change check timeout (currently 5000ms)
const timeoutId = setTimeout(() => controller.abort(), 5000);

// Change result filename pattern
link.download = `checker_${status}_results_${...}.txt`;

// Add/remove statistics
const stats = {
  total: checkResults.length,
  // Add new stat here
};
```

## UI Components

- **Mode Tabs**: Blue active, gray inactive
- **Results Grid**: 4-column stat display (responsive)
- **Results List**: Scrollable with max-height 384px
- **Status Indicators**: Check (✓) for LIVE, X (✗) for DEAD
- **Badges**: Color-coded status (green/red)

## Error Handling

Common errors shown:
- "HTTP 404" - URL not found
- "HTTP 500" - Server error
- "Unknown content-type" - Invalid response format
- "Fetch failed" - Network error or timeout
- "CORS error" - Cross-origin restriction

## Future Enhancements

Possible improvements:
- Export results as CSV
- Schedule periodic checks
- Email notifications for broken links
- Bulk URL validation history
- Advanced filtering options
