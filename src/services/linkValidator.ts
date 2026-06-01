/**
 * Service untuk memvalidasi dan memeriksa status link video
 */

export interface LinkCheckResult {
  id: string;
  video_url: string;
  isValid: boolean;
  isPlayable: boolean; // NEW: Apakah video bisa diplay
  statusCode?: number;
  error?: string;
  playbackError?: string; // NEW: Error saat playback
  checkedAt: string;
}

export const linkValidator = {
  /**
   * Test apakah video bisa di-play dengan cara loading ke video element
   */
  testVideoPlayback: async (url: string): Promise<{ playable: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const timeout = setTimeout(() => {
        video.src = '';
        resolve({ playable: false, error: 'Playback test timeout' });
      }, 10000); // 10 detik timeout

      video.onloadedmetadata = () => {
        clearTimeout(timeout);
        video.src = '';
        resolve({ playable: true });
      };

      video.onerror = () => {
        clearTimeout(timeout);
        const errorCode = video.error?.code;
        let errorMsg = 'Unknown error';
        
        if (errorCode === 1) errorMsg = 'MEDIA_ERR_ABORTED';
        if (errorCode === 2) errorMsg = 'MEDIA_ERR_NETWORK';
        if (errorCode === 3) errorMsg = 'MEDIA_ERR_DECODE';
        if (errorCode === 4) errorMsg = 'MEDIA_ERR_SRC_NOT_SUPPORTED';
        
        video.src = '';
        resolve({ playable: false, error: errorMsg });
      };

      video.crossOrigin = 'anonymous';
      video.src = url;
    });
  },

  /**
   * Cek apakah link bisa diakses (HEAD request) + test playback
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

      // Test playback jika HEAD request successful
      let isPlayable = false;
      let playbackError = undefined;

      if (response.ok || response.status === 0) {
        try {
          const playbackResult = await linkValidator.testVideoPlayback(url);
          isPlayable = playbackResult.playable;
          playbackError = playbackResult.error;
        } catch (playbackErr) {
          isPlayable = false;
          playbackError = 'Playback test failed';
        }
      }

      return {
        id: videoId,
        video_url: url,
        isValid: response.ok || response.status === 0,
        isPlayable: isPlayable,
        statusCode: response.status,
        playbackError: playbackError,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        id: videoId,
        video_url: url,
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
