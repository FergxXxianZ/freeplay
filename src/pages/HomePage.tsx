import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation } from 'react-router-dom';
import { videoService } from '../services/videoService';
import { VideoCard, VideoCardSkeleton } from '../components/VideoCard';
import { Pagination } from '../components/Pagination';
import { PaginationData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Search, Film } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { pageNumber } = useParams<{ pageNumber: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [data, setData] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);

  const currentPage = parseInt(pageNumber || '1', 10);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const result = videoService.getVideos(currentPage, searchQuery);
      setData(result);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery, location.pathname]);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero Banner — only on first page without search */}
      {!searchQuery && currentPage === 1 && (
        <div style={{
          position: 'relative',
          height: 320,
          marginTop: -68, // Pull up under navbar
          marginBottom: 40,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #0d0d0d 100%)',
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(229,9,20,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 30%, rgba(229,9,20,0.08) 0%, transparent 40%)',
          }} />
          {/* Diagonal stripes */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0px, #fff 1px, transparent 1px, transparent 20px)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #141414 0%, rgba(20,20,20,0.3) 40%, transparent 70%)',
          }} />

          {/* Hero Content */}
          <div style={{
            position: 'absolute', bottom: 40, left: 40,
            maxWidth: 500,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#E50914', color: '#fff',
              padding: '3px 10px', borderRadius: 3,
              fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              <Film style={{ width: 11, height: 11 }} />
              FreePlay Original
            </div>
            <h1 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              textShadow: '0 2px 20px rgba(0,0,0,0.8)',
            }}>
              Stream Unlimited<br />Free Videos
            </h1>
            <a
              href="#content"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#E50914', color: '#fff',
                padding: '10px 24px', borderRadius: 4,
                fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700,
                textDecoration: 'none',
                transition: 'background 0.2s',
                boxShadow: '0 4px 20px rgba(229,9,20,0.4)',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#c40812')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = '#E50914')}
            >
              <Play style={{ width: 16, height: 16, fill: '#fff' }} />
              Browse All
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div id="content" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 48px' }}>

        {/* Section Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            {searchQuery ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Search style={{ width: 16, height: 16, color: '#E50914' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#E50914', fontWeight: 600 }}>
                    Hasil Pencarian
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 800,
                  color: '#fff', letterSpacing: '-0.02em', margin: 0,
                }}>
                  "{searchQuery}"
                </h2>
              </>
            ) : (
              <>
                <h2 className="red-accent" style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 700,
                  color: '#fff', letterSpacing: '-0.01em', margin: 0,
                }}>
                  {currentPage === 1 ? 'Recommended For You' : `Page ${currentPage}`}
                </h2>
              </>
            )}
            {data && !loading && (
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.35)', marginTop: 6,
              }}>
                {data.videos.length} video{data.videos.length !== 1 ? 's' : ''} · Page {currentPage} of {data.totalPages}
              </p>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          <AnimatePresence mode="wait">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)
            ) : data?.videos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}
              >
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(229,9,20,0.1)', border: '2px solid rgba(229,9,20,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Search style={{ width: 28, height: 28, color: '#E50914' }} />
                </div>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', fontWeight: 600,
                  color: '#fff', marginBottom: 8,
                }}>
                  Tidak ada video ditemukan
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                  Coba kata kunci yang berbeda
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  style={{
                    marginTop: 20, padding: '10px 24px', borderRadius: 4,
                    background: '#E50914', border: 'none', color: '#fff',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Kembali ke Beranda
                </button>
              </motion.div>
            ) : (
              data?.videos.map((video) => <VideoCard key={video.id} video={video} />)
            )}
          </AnimatePresence>
        </div>

        {data && !loading && (
          <Pagination currentPage={data.currentPage} totalPages={data.totalPages} searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
};
