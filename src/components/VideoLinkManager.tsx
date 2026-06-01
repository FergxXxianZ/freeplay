import React, { useEffect, useState } from 'react';
import { Video } from '../types';
import videoData from '../data/videos.json';
import { linkValidator, LinkCheckResult } from '../services/linkValidator';
import { Edit2, Trash2, Check, X, Loader, RefreshCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoWithStatus extends Video {
  linkStatus?: LinkCheckResult;
}

export const VideoLinkManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoWithStatus[]>(videoData as Video[]);
  const [checkResults, setCheckResults] = useState<LinkCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'valid' | 'invalid'>('all');

  /**
   * Cek semua link
   */
  const handleCheckAllLinks = async () => {
    setIsChecking(true);
    const urls = videos.map(v => v.video_url);
    const results = await linkValidator.checkMultipleLinks(urls);
    
    setCheckResults(results);
    linkValidator.saveLinkCheckCache(results);
    
    // Update video list dengan status
    const updatedVideos = videos.map(v => {
      const status = results.find(r => r.video_url === v.video_url);
      return { ...v, linkStatus: status };
    });
    setVideos(updatedVideos);
    setIsChecking(false);
  };

  /**
   * Edit URL video
   */
  const handleEditLink = (video: Video) => {
    setEditingId(video.id);
    setEditUrl(video.video_url);
  };

  /**
   * Simpan perubahan URL
   */
  const handleSaveLink = (video: Video) => {
    const updatedVideos = videos.map(v => 
      v.id === video.id ? { ...v, video_url: editUrl } : v
    );
    setVideos(updatedVideos);
    setEditingId(null);
    // Simpan ke localStorage (untuk development)
    localStorage.setItem('videos_data', JSON.stringify(updatedVideos));
  };

  /**
   * Hapus video
   */
  const handleDeleteVideo = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus video ini?')) {
      const updatedVideos = videos.filter(v => v.id !== id);
      setVideos(updatedVideos);
      localStorage.setItem('videos_data', JSON.stringify(updatedVideos));
    }
  };

  /**
   * Hapus semua link yang invalid/rusak
   */
  const handleAutoCleanup = async () => {
    const invalidLinks = linkValidator.getInvalidLinks(checkResults);
    
    if (invalidLinks.length === 0) {
      alert('Tidak ada link yang rusak');
      return;
    }

    if (confirm(`Hapus ${invalidLinks.length} video dengan link rusak?`)) {
      const invalidUrls = invalidLinks.map(l => l.video_url);
      const cleanedVideos = videos.filter(v => !invalidUrls.includes(v.video_url));
      
      setVideos(cleanedVideos);
      setCheckResults(checkResults.filter(r => r.isValid));
      localStorage.setItem('videos_data', JSON.stringify(cleanedVideos));
      alert(`${invalidLinks.length} video berhasil dihapus`);
    }
  };

  /**
   * Export data sebagai JSON
   */
  const handleExportData = () => {
    const dataStr = JSON.stringify(videos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `videos_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  /**
   * Filter videos berdasarkan status link
   */
  const filteredVideos = videos.filter(v => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'valid') return v.linkStatus?.isValid !== false;
    if (filterStatus === 'invalid') return v.linkStatus?.isValid === false;
    return true;
  });

  const invalidCount = checkResults.filter(r => !r.isValid).length;
  const validCount = checkResults.filter(r => r.isValid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Video Link Manager</h1>
          <p className="text-gray-400">Kelola dan validasi semua link video Anda</p>
        </motion.div>

        {/* Stats & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 text-white"
          >
            <p className="text-sm opacity-90 mb-1">Total Video</p>
            <p className="text-3xl font-bold">{videos.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-white"
          >
            <p className="text-sm opacity-90 mb-1">Link Valid</p>
            <p className="text-3xl font-bold">{validCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 text-white"
          >
            <p className="text-sm opacity-90 mb-1">Link Rusak</p>
            <p className="text-3xl font-bold">{invalidCount}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white"
          >
            <p className="text-sm opacity-90 mb-1">Kesehatan</p>
            <p className="text-3xl font-bold">
              {videos.length > 0 ? Math.round((validCount / videos.length) * 100) : 0}%
            </p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <button
            onClick={handleCheckAllLinks}
            disabled={isChecking}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
          >
            {isChecking ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {isChecking ? 'Memeriksa...' : 'Cek Semua Link'}
          </button>

          <button
            onClick={handleAutoCleanup}
            disabled={invalidCount === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition"
          >
            <Trash2 className="w-5 h-5" />
            Hapus Link Rusak ({invalidCount})
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Export JSON
          </button>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-3 mb-8">
          {(['all', 'valid', 'invalid'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status === 'all' && 'Semua'}
              {status === 'valid' && '✓ Valid'}
              {status === 'invalid' && '✗ Rusak'}
            </button>
          ))}
        </div>

        {/* Video List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Title */}
                  <div className="md:col-span-3">
                    <p className="text-white font-semibold truncate">{video.title}</p>
                    <p className="text-gray-400 text-sm">{video.id}</p>
                  </div>

                  {/* URL - Edit Mode */}
                  <div className="md:col-span-5">
                    {editingId === video.id ? (
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Masukkan URL baru..."
                      />
                    ) : (
                      <p className="text-gray-300 text-sm truncate">{video.video_url}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2">
                    {video.linkStatus ? (
                      <div className="flex items-center gap-2">
                        {video.linkStatus.isValid ? (
                          <>
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-green-500 text-sm">Valid</span>
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 text-red-500" />
                            <span className="text-red-500 text-sm">Rusak</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Belum cek</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex gap-2 justify-end">
                    {editingId === video.id ? (
                      <>
                        <button
                          onClick={() => handleSaveLink(video)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditLink(video)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                          title="Edit link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition"
                          title="Hapus video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Tidak ada video ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};
