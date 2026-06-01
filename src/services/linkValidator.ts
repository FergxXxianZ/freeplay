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
   * Menggunakan fetch dengan Range header untuk check stream availability
   */
  testVideoPlayback: async (url: string): Promise<{ playable: boolean; error?: string }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Try fetching dengan Range request (untuk streaming support)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1', // Request hanya 1 byte untuk test
        },
        mode: 'cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Status 200, 206 (Partial Content), atau 302 (redirect) semua OK
      const isPlayable = response.ok || response.status === 206 || response.status === 302;
      
      if (isPlayable) {
        return { playable: true };
      } else {
        return { 
          playable: false, 
          error: `HTTP ${response.status}` 
        };
      }
    } catch (error) {
      return {
        playable: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
      };
    }
  },

  /**
   * Cek apakah link bisa diakses dan playable di freeplays.vercel.app
   * Strategy: Fetch alternative URL (freeplays.vercel.app/video/ID) langsung
   */
  checkLinkAccess: async (url: string): Promise<LinkCheckResult> => {
    const videoId = linkValidator.extractVideoId(url);
    const alternativeUrl = linkValidator.getAlternativeUrl(url);
    
    try {
      // Test playback langsung di alternative URL
      const playbackResult = await linkValidator.testVideoPlayback(alternativeUrl);

      return {
        id: videoId,
        video_url: url, // Keep original CDN URL
        alternativeUrl: alternativeUrl,
        isValid: playbackResult.playable, // Jika accessible = valid
        isPlayable: playbackResult.playable, // Jika bisa di-fetch = playable
        playbackError: playbackResult.error,
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
