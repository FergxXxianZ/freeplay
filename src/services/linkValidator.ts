/**
 * Service untuk memvalidasi dan memeriksa status link video
 */

export interface LinkCheckResult {
  id: string;
  video_url: string;
  alternativeUrl?: string; // URL freeplays.vercel.app yang di-check
  isValid: boolean;
  isPlayable: boolean; // Apakah video bisa diplay di alternative URL
  statusCode?: number;
  error?: string;
  playbackError?: string; // Error saat playback
  checkedAt: string;
}

export const linkValidator = {
  /**
   * Extract video ID dari URL CDN
   * Contoh: https://cdn.videy.co/eNukFzWp1.mp4 → eNukFzWp1
   */
  extractVideoId: (url: string): string => {
    const match = url.match(/\/([a-zA-Z0-9]+)\.mp4$/);
    return match ? match[1] : url.split('/').pop()?.replace('.mp4', '') || 'unknown';
  },

  /**
   * Generate alternative URL di freeplays.vercel.app
   * Contoh: https://cdn.videy.co/eNukFzWp1.mp4 → https://freeplays.vercel.app/video/eNukFzWp1
   */
  getAlternativeUrl: (cdnUrl: string): string => {
    const videoId = linkValidator.extractVideoId(cdnUrl);
    return `https://freeplays.vercel.app/video/${videoId}`;
  },

  /**
   * Test apakah video bisa di-fetch (accessible)
   * Strategy: 
   * - Jika status bukan 200/206 → Tidak OK (including 404, 500, etc)
   * - Jika response video dari CDN (video/*) → OK
   * - Jika response HTML dari website dan status 200 → OK
   * - Jika error status atau unknown type → Tidak OK
   */
  testVideoPlayback: async (url: string): Promise<{ playable: boolean; error?: string }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Try HEAD request first untuk cek header tanpa download content
      const headResponse = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
        signal: controller.signal,
      }).catch(() => null); // Jika HEAD gagal, lanjut ke GET

      clearTimeout(timeoutId);

      // Jika HEAD berhasil dan status adalah 200 atau 206
      if (headResponse && (headResponse.ok || headResponse.status === 206)) {
        const contentType = headResponse.headers.get('content-type')?.toLowerCase() || '';
        const contentLength = headResponse.headers.get('content-length');
        const statusCode = headResponse.status;
        
        // Case 1: Video content-type
        if (contentType.includes('video')) {
          // Validasi: harus ada content atau minimal 1KB
          if (contentLength) {
            const size = parseInt(contentLength);
            if (size > 1000) {
              return { playable: true };
            }
          } else {
            return { playable: true }; // No content-length but is video
          }
        }
        
        // Case 2: HTML response hanya valid jika status 200 (bukan error page)
        if (contentType.includes('text/html') && statusCode === 200) {
          return { playable: true }; // Website page = video ada di database
        }
        
        // Case 3: Unknown type
        return { 
          playable: false, 
          error: `Unknown content-type: ${contentType || 'not set'}` 
        };
      }

      // HEAD gagal atau tidak OK (4xx, 5xx), coba GET dengan Range
      if (headResponse && !headResponse.ok && headResponse.status >= 400) {
        return { 
          playable: false, 
          error: `HTTP ${headResponse.status}` 
        };
      }

      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 5000);

      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1', // Request hanya 1 byte untuk test
        },
        mode: 'cors',
        signal: controller2.signal,
      });

      clearTimeout(timeoutId2);

      // Check GET response - harus status 200 atau 206, bukan error
      if (getResponse.status >= 400) {
        return { 
          playable: false, 
          error: `HTTP ${getResponse.status}` 
        };
      }

      if (getResponse.ok || getResponse.status === 206) {
        const contentType = getResponse.headers.get('content-type')?.toLowerCase() || '';
        const statusCode = getResponse.status;
        
        // Video type = OK
        if (contentType.includes('video')) {
          return { playable: true };
        }
        
        // HTML hanya valid jika status 200 (bukan error page)
        if (contentType.includes('text/html') && statusCode === 200) {
          return { playable: true };
        }
        
        // Unknown type
        return { 
          playable: false, 
          error: `Unknown content-type: ${contentType}` 
        };
      }

      // Status bukan 200/206 = error
      return { 
        playable: false, 
        error: `HTTP ${getResponse.status}` 
      };
    } catch (error) {
      return {
        playable: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
      };
    }
  },

  /**
   * Cek apakah link bisa diakses dan playable
   * Strategy: 
   * 1. Test original CDN URL directly untuk cek akses
   * 2. Jika CDN URL valid, test alternative URL di freeplays.vercel.app
   * 3. Return true hanya jika keduanya OK atau salah satu yang penting OK
   */
  checkLinkAccess: async (url: string): Promise<LinkCheckResult> => {
    const videoId = linkValidator.extractVideoId(url);
    const alternativeUrl = linkValidator.getAlternativeUrl(url);
    
    try {
      // Test original CDN URL directly (lebih prioritas)
      const cdnPlaybackResult = await linkValidator.testVideoPlayback(url);

      // Jika CDN URL sudah valid, gunakan hasil itu
      if (cdnPlaybackResult.playable) {
        return {
          id: videoId,
          video_url: url,
          alternativeUrl: alternativeUrl,
          isValid: true,
          isPlayable: true,
          checkedAt: new Date().toISOString(),
        };
      }

      // Jika CDN gagal, coba test alternative URL di freeplays.vercel.app
      const altPlaybackResult = await linkValidator.testVideoPlayback(alternativeUrl);

      return {
        id: videoId,
        video_url: url,
        alternativeUrl: alternativeUrl,
        isValid: altPlaybackResult.playable,
        isPlayable: altPlaybackResult.playable,
        playbackError: altPlaybackResult.error,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: videoId,
        video_url: url,
        alternativeUrl: alternativeUrl,
        isValid: false,
        isPlayable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date().toISOString(),
      };
    }
  },

  /**
   * Cek multiple links sekaligus
   */
  checkMultipleLinks: async (urls: string[]): Promise<LinkCheckResult[]> => {
    const results = await Promise.all(
      urls.map(url => linkValidator.checkLinkAccess(url))
    );
    return results;
  },

  /**
   * Simpan hasil validasi ke localStorage
   */
  saveLinkCheckCache: (results: LinkCheckResult[]): void => {
    const cache = {
      timestamp: new Date().toISOString(),
      results: results,
    };
    localStorage.setItem('link_validation_cache', JSON.stringify(cache));
  },

  /**
   * Ambil cache validasi link
   */
  getLinkCheckCache: (maxAgeMinutes: number = 60): LinkCheckResult[] | null => {
    const cached = localStorage.getItem('link_validation_cache');
    if (!cached) return null;

    const cache = JSON.parse(cached);
    const cacheAge = Date.now() - new Date(cache.timestamp).getTime();
    const maxAge = maxAgeMinutes * 60 * 1000;

    if (cacheAge > maxAge) {
      localStorage.removeItem('link_validation_cache');
      return null;
    }

    return cache.results;
  },

  /**
   * Dapatkan links yang tidak valid atau tidak bisa diplay
   */
  getInvalidLinks: (results: LinkCheckResult[]): LinkCheckResult[] => {
    return results.filter(r => !r.isValid || !r.isPlayable);
  },

  /**
   * Dapatkan hanya links yang tidak bisa diplay (tapi HTTP valid)
   */
  getNonPlayableLinks: (results: LinkCheckResult[]): LinkCheckResult[] => {
    return results.filter(r => r.isValid && !r.isPlayable);
  },
};
