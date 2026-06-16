import React, { useState, useRef } from 'react';
import { Video } from '../types';
import videoData from '../data/videos.json';
import { linkValidator, LinkCheckResult } from '../services/linkValidator';
import { Upload, RefreshCw, Download, FileText, AlertCircle, Check, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type CheckerMode = 'videos' | 'file';

interface CheckResult extends LinkCheckResult {
  url?: string;
}

export const CheckerPage: React.FC = () => {
  const [mode, setMode] = useState<CheckerMode>('videos');
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [customDomains, setCustomDomains] = useState('');
  const [rawInput, setRawInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  /**
   * Handle file upload untuk mode "file"
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawInput(content);
      setUploadedFileName(file.name);
    };
    reader.readAsText(file);
  };

  /**
   * Extract links dari videos.json yang sudah tidak aktif/dead
   */
  const getInactiveLinksFromVideos = (): Video[] => {
    return (videoData as Video[]);
  };

  /**
   * Check all videos dari videos.json
   */
  const handleCheckVideosLinks = async () => {
    setIsChecking(true);
    const videos = getInactiveLinksFromVideos();
    const urls = videos.map(v => v.video_url);

    try {
      const results = await linkValidator.checkMultipleLinks(urls);
      const enrichedResults = results.map((result, index) => ({
        ...result,
        url: urls[index],
      })) as CheckResult[];

      setCheckResults(enrichedResults);
      linkValidator.saveLinkCheckCache(enrichedResults);
    } catch (error) {
      alert('Error checking links: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Check links dari file upload
   */
  const handleCheckFileLinks = async () => {
    if (!rawInput.trim()) {
      alert('Masukkan URL atau upload file terlebih dahulu!');
      return;
    }

    setIsChecking(true);
    const domains = customDomains
      .split(',')
      .map((d: string) => d.trim())
      .filter((d: string) => d);
    
    const links = [
      ...new Set(
        rawInput
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l)
      ),
    ];

    if (links.length === 0) {
      alert('Tidak ada URL yang valid!');
      setIsChecking(false);
      return;
    }

    try {
      // Check links dengan streaming untuk UX yang lebih baik
      const results: CheckResult[] = [];
      
      for (const link of links as string[]) {
        try {
          const result = await linkValidator.checkLinkAccess(link as string);
          const enrichedResult: CheckResult = {
            ...result,
            url: link as string,
          };
          results.push(enrichedResult);
          setCheckResults([...results]);
        } catch (error) {
          results.push({
            id: (link as string).split('/').pop()?.replace('.mp4', '') || 'unknown',
            video_url: link as string,
            url: link as string,
            isValid: false,
            isPlayable: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            checkedAt: new Date().toISOString(),
          });
          setCheckResults([...results]);
        }
      }

      setCheckResults(results);
    } catch (error) {
      alert('Error checking links: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Download results
   */
  const downloadResults = (status: 'all' | 'live' | 'dead') => {
    let data: string[];

    if (status === 'live') {
      data = checkResults.filter((r: CheckResult) => r.isPlayable).map((r: CheckResult) => r.url || r.video_url);
    } else if (status === 'dead') {
      data = checkResults.filter((r: CheckResult) => !r.isPlayable).map((r: CheckResult) => r.url || r.video_url);
    } else {
      data = checkResults.map((r: CheckResult) => r.url || r.video_url);
    }

    const blob = new Blob([data.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `checker_${status}_results_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Hitung statistik
   */
  const stats = {
    total: checkResults.length,
    live: checkResults.filter((r: CheckResult) => r.isPlayable).length,
    dead: checkResults.filter((r: CheckResult) => !r.isPlayable).length,
    health: checkResults.length > 0 ? Math.round((checkResults.filter((r: CheckResult) => r.isPlayable).length / checkResults.length) * 100) : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Link Checker</h1>
          <p className="text-gray-400">Periksa status link video dari berbagai sumber</p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          <button
            onClick={() => {
              setMode('videos');
              setCheckResults([]);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              mode === 'videos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            Cek Videos JSON
          </button>
          <button
            onClick={() => {
              setMode('file');
              setCheckResults([]);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              mode === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Upload className="w-5 h-5" />
            Cek File TXT
          </button>
        </motion.div>

        {/* Mode: Check Videos JSON */}
        {mode === 'videos' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">Periksa Semua Video dari videos.json</h2>
            <p className="text-gray-400 mb-6">Sistem akan mengecek status setiap URL dari file videos.json</p>

            <button
              onClick={handleCheckVideosLinks}
              disabled={isChecking}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg transition font-semibold"
            >
              {isChecking ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Memeriksa {checkResults.length + 1}...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Mulai Pemeriksaan
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Mode: Check File */}
        {mode === 'file' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">Upload & Periksa URL dari File</h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Upload File TXT</label>
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                >
                  <Upload className="w-5 h-5" />
                  Pilih File
                </button>
                {uploadedFileName && (
                  <span className="flex items-center text-gray-300 bg-gray-700 px-4 py-2 rounded-lg">
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    {uploadedFileName}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Atau Paste URLs (1 per baris)</label>
              <textarea
                value={rawInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRawInput(e.target.value)}
                placeholder="https://example.com/video1.mp4&#10;https://example.com/video2.mp4"
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Custom Domains */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Domain Kustom (opsional, pisahkan dengan koma)</label>
              <input
                type="text"
                value={customDomains}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomDomains(e.target.value)}
                placeholder="example.com, custom.domain.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Check Button */}
            <button
              onClick={handleCheckFileLinks}
              disabled={isChecking || !rawInput.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg transition font-semibold"
            >
              {isChecking ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Memeriksa {checkResults.length + 1}...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Mulai Pemeriksaan
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Results Statistics */}
        {checkResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Total Diperiksa</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">LIVE</p>
              <p className="text-3xl font-bold">{stats.live}</p>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">DEAD</p>
              <p className="text-3xl font-bold">{stats.dead}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Kesehatan</p>
              <p className="text-3xl font-bold">{stats.health}%</p>
            </div>
          </motion.div>
        )}

        {/* Download Buttons */}
        {checkResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <button
              onClick={() => downloadResults('all')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Download Semua ({stats.total})
            </button>
            <button
              onClick={() => downloadResults('live')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Download LIVE ({stats.live})
            </button>
            <button
              onClick={() => downloadResults('dead')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              Download DEAD ({stats.dead})
            </button>
          </motion.div>
        )}

        {/* Results List */}
        <AnimatePresence>
          {checkResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-white">Hasil Pemeriksaan</h3>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-gray-700">
                {checkResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 ${
                      result.isPlayable ? 'bg-gray-800/30' : 'bg-red-900/10'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${result.isPlayable ? 'text-green-400' : 'text-red-400'}`}>
                      {result.isPlayable ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <X className="w-6 h-6" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                            result.isPlayable
                              ? 'bg-green-900 text-green-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {result.isPlayable ? 'LIVE' : 'DEAD'}
                        </span>
                        <span className="text-xs text-gray-500">{result.id}</span>
                      </div>
                      <p className="text-sm text-gray-300 truncate">{result.url || result.video_url}</p>
                      {result.error && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {result.error}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {checkResults.length === 0 && !isChecking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center"
          >
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Belum ada hasil pemeriksaan</p>
            <p className="text-gray-500 text-sm mt-2">
              {mode === 'videos'
                ? 'Klik tombol di atas untuk mulai memeriksa semua video dari videos.json'
                : 'Upload file atau paste URL untuk mulai pemeriksaan'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
