import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#1a1a1a',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, z-index 0s',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.8), 0 0 0 2px rgba(229,9,20,0.5)'
          : '0 2px 8px rgba(0,0,0,0.5)',
        zIndex: hovered ? 10 : 1,
      }}
    >
      {/* Thumbnail */}
      <Link to={`/video/${video.id}`} style={{ display: 'block', aspectRatio: '16/9', position: 'relative', overflow: 'hidden', background: '#111' }}>
        <video
          src={`${video.video_url}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          loop
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.5; }}
        />

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hovered
            ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
          transition: 'background 0.3s ease',
        }} />

        {/* Play button */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}>
              <Play style={{ width: 20, height: 20, fill: '#141414', color: '#141414', marginLeft: 3 }} />
            </div>
          </motion.div>
        )}

        {/* Red top accent bar on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3, background: '#E50914',
          }} />
        )}
      </Link>

      {/* Info panel — shown on hover */}
      <div style={{
        padding: hovered ? '12px 14px 14px' : '10px 12px 12px',
        background: hovered ? '#1f1f1f' : '#1a1a1a',
        transition: 'all 0.3s ease',
      }}>
        <Link to={`/video/${video.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: hovered ? '#fff' : '#ccc',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            transition: 'color 0.2s',
            margin: 0,
          }}>
            {video.title}
          </h3>
        </Link>

        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Link
              to={`/video/${video.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#fff', color: '#141414',
                padding: '5px 14px', borderRadius: 4,
                fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <Play style={{ width: 12, height: 12, fill: '#141414' }} />
              Play
            </Link>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}>
              frgnz.co
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export const VideoCardSkeleton: React.FC = () => (
  <div style={{ borderRadius: 6, overflow: 'hidden', background: '#1a1a1a' }}>
    <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%' }} />
    <div style={{ padding: '10px 12px 12px' }}>
      <div className="skeleton" style={{ height: 14, width: '75%' }} />
      <div className="skeleton" style={{ height: 12, width: '50%', marginTop: 8 }} />
    </div>
  </div>
);
