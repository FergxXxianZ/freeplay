/**
 * Service untuk memvalidasi dan memeriksa status link video
 */

export interface LinkCheckResult {
  id: string;
  video_url: string;
  isValid: boolean;
  statusCode?: number;
  error?: string;
  checkedAt: string;
}

export const linkValidator = {
  /**
   * Cek apakah link bisa diakses (HEAD request)
   */
  checkLinkAccess: async (url: string): Promise<LinkCheckResult> => {
    const videoId = url.split('/').pop()?.replace('.mp4', '') || 'unknown';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 detik timeout

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        id: videoId,
        video_url: url,
        isValid: response.ok || response.status === 0, // 0 untuk no-cors
        statusCode: response.status,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: videoId,
        video_url: url,
        isValid: false,
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
   * Dapatkan links yang tidak valid
   */
  getInvalidLinks: (results: LinkCheckResult[]): LinkCheckResult[] => {
    return results.filter(r => !r.isValid);
  },
};
