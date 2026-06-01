import { Video } from '../types';
import videoData from '../data/videos.json';
import { linkValidator, LinkCheckResult } from './linkValidator';

/**
 * Service untuk auto-cleanup link yang rusak
 * Dapat dijalankan secara berkala/otomatis
 */
export const autoCleanupService = {
  /**
   * Check dan auto-remove video dengan link rusak
   * @param maxAgeMinutes - waktu cache validasi sebelum di-recheck
   */
  autoRemoveBrokenLinks: async (
    videos: Video[],
    maxAgeMinutes: number = 60
  ): Promise<{ removed: Video[]; remaining: Video[] }> => {
    // Ambil cache atau lakukan check baru
    let checkResults = linkValidator.getLinkCheckCache(maxAgeMinutes);
    
    if (!checkResults) {
      const urls = videos.map(v => v.video_url);
      checkResults = await linkValidator.checkMultipleLinks(urls);
      linkValidator.saveLinkCheckCache(checkResults);
    }

    const invalidResults = linkValidator.getInvalidLinks(checkResults);
    const invalidUrls = invalidResults.map(r => r.video_url);

    const removed = videos.filter(v => invalidUrls.includes(v.video_url));
    const remaining = videos.filter(v => !invalidUrls.includes(v.video_url));

    return { removed, remaining };
  },

  /**
   * Setup interval untuk auto-cleanup berkala
   * @param intervalMinutes - interval dalam menit
   * @returns function untuk stop interval
   */
  startAutoCleanupInterval: (intervalMinutes: number = 60): (() => void) => {
    const intervalId = setInterval(async () => {
      try {
        const videosData = (videoData as Video[]);
        const result = await autoCleanupService.autoRemoveBrokenLinks(videosData);
        
        if (result.removed.length > 0) {
          console.log(`[Auto-Cleanup] Removed ${result.removed.length} videos with broken links:`, result.removed);
          
          // Simpan data yang sudah dibersihkan ke localStorage
          localStorage.setItem('videos_data_backup', JSON.stringify(videosData));
          localStorage.setItem('auto_cleanup_log', JSON.stringify({
            timestamp: new Date().toISOString(),
            removed: result.removed.length,
            remaining: result.remaining.length,
            removedVideos: result.removed,
          }));
        }
      } catch (error) {
        console.error('[Auto-Cleanup] Error:', error);
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(intervalId);
  },

  /**
   * Dapatkan log cleanup terakhir
   */
  getCleanupLog: (): any | null => {
    const log = localStorage.getItem('auto_cleanup_log');
    return log ? JSON.parse(log) : null;
  },

  /**
   * Reset cleanup log
   */
  resetCleanupLog: (): void => {
    localStorage.removeItem('auto_cleanup_log');
  },

  /**
   * Restore dari backup
   */
  restoreFromBackup: (): Video[] | null => {
    const backup = localStorage.getItem('videos_data_backup');
    return backup ? JSON.parse(backup) : null;
  },

  /**
   * Validate link dan tampilkan hasil detail
   */
  validateAndReport: async (videos: Video[]): Promise<{
    summary: { total: number; valid: number; invalid: number; healthPercentage: number };
    invalidVideos: Array<Video & { error?: string }>;
    validVideos: Video[];
  }> => {
    const urls = videos.map(v => v.video_url);
    const results = await linkValidator.checkMultipleLinks(urls);

    const validResults = results.filter(r => r.isValid);
    const invalidResults = results.filter(r => !r.isValid);

    const validVideos = videos.filter(v =>
      validResults.some(r => r.video_url === v.video_url)
    );

    const invalidVideos = videos.filter(v =>
      invalidResults.some(r => r.video_url === v.video_url)
    ).map((video, idx) => {
      const error = invalidResults.find(r => r.video_url === video.video_url)?.error;
      return { ...video, error };
    });

    return {
      summary: {
        total: videos.length,
        valid: validResults.length,
        invalid: invalidResults.length,
        healthPercentage: videos.length > 0 ? Math.round((validResults.length / videos.length) * 100) : 0,
      },
      invalidVideos,
      validVideos,
    };
  },
};
