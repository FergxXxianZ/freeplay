import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoService } from '../services/videoService';
import { Video } from '../types';
import { VideoCard } from '../components/VideoCard';
import { ChevronLeft, Share2, ThumbsUp, Eye, Play} from 'lucide-react';
import { motion } from 'motion/react';

export const VideoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [liked, setLiked] = useState(false);
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getStoredViews = (videoId: string) => {
    const data = JSON.parse(
      localStorage.getItem('video_views') || '{}'
    );

    if (!data[videoId]) {
      data[videoId] = Math.floor(
        Math.random() * 50000
      ) + 500;

      localStorage.setItem(
        'video_views',
        JSON.stringify(data)
      );
    }

    return data[videoId];
  };

  const channels = [
    'FreePlay Official',
    'Videy Viral',
    'Bokep Indo',
    'Doodstream',
    'Pemersatu Bangsa',
    'Video Pemersatu',
    'Videy Update',
    'Dunia Malam',
    'Bahan Colimu',
    'Video Enak Enak'
  ];

  const getChannelName = (id: string) => {
    let hash = 0;

    for (let i = 0; i < id.length; i++) {
      hash += id.charCodeAt(i);
    }

    return channels[hash % channels.length];
  };

  const getStoredLikes = (videoId: string) => {
    const data = JSON.parse(
      localStorage.getItem('video_likes') || '{}'
    );

    if (!data[videoId]) {
      data[videoId] = Math.floor(Math.random() * 15000) + 100;

      localStorage.setItem(
        'video_likes',
        JSON.stringify(data)
      );
    }

    return data[videoId];
  };

  useEffect(() => {
    if (id) {
      const v = videoService.getVideoById(id);
      if (v) {
        setVideo(v);
        setRelated(videoService.getRelatedVideos(id));
        window.scrollTo(0, 0);
      }
    }
  }, [id]);

  const handleLike = () => {
    if (!id) return;

    const likesData = JSON.parse(
      localStorage.getItem('video_likes') || '{}'
    );

    const likedVideos = JSON.parse(
      localStorage.getItem('liked_videos') || '{}'
    );

    if (likedVideos[id]) {
      likesData[id] -= 1;
      delete likedVideos[id];

      setLiked(false);
    } else {
      likesData[id] = (likesData[id] || 0) + 1;
      likedVideos[id] = true;

      setLiked(true);
    }

    localStorage.setItem(
      'video_likes',
      JSON.stringify(likesData)
    );

    localStorage.setItem(
      'liked_videos',
      JSON.stringify(likedVideos)
    );

    setLikes(likesData[id]);
  };

  useEffect(() => {
    if (!id) return;

    const viewsData = JSON.parse(
      localStorage.getItem('video_views') || '{}'
    );

    if (!viewsData[id]) {
      viewsData[id] = Math.floor(
        Math.random() * 50000
      ) + 500;
    }

    const viewedKey = `viewed_${id}`;
    const viewed = sessionStorage.getItem(viewedKey);

    if (!viewed) {
      viewsData[id] += 1;

      sessionStorage.setItem(
        viewedKey,
        'true'
      );
    }

    localStorage.setItem(
      'video_views',
      JSON.stringify(viewsData)
    );

    setViews(viewsData[id]);
    setLikes(getStoredLikes(id));

    const likedVideos = JSON.parse(
      localStorage.getItem('liked_videos') || '{}'
    );

    setLiked(!!likedVideos[id]);
  }, [id]);

  if (!video) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            Video tidak ditemukan
          </p>
          <Link to="/" style={{ color: '#E50914', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  {/*UNTUK TAMBAH DOMAIN*/}
  const allowedDomains = [
    'https://vid30s.com/',
    'https://cdn2.slirpdrive.com/', 
    'https://cdn.slicsdrive.com/',
    'https://assets.vid4me.com/',
    'https://interstitial.slicedrive.com/',
    'https://cdn2.slicedrive.com/',
    'https://aceimg.com/', 
    'https://aceimg.com/upload/?f=', 
    'https://cdn2.slicedrive.co/', 
    'https://media.slicedrive.com/',
    'https://cdn.videy.co/',
    'https://cdn2.videy.co/',
    'https://videy.co/', 
    'https://cdn2.aceimg.com/', 
    'https://cdn2.vildey.com/', 
    'https://cdn.aceimg.com/', 
  ];

  const isSecureUrl = allowedDomains.some(domain =>
    video.video_url.startsWith(domain)
  );

  const isIframeUrl =
    video.video_url.includes('/e/') ||
    video.video_url.includes('/upload/?f=');
  
  return (
    <div className="mx-auto px-4 sm:px-6 md:px-8 py-6 pb-16" style={{ maxWidth: 1400 }}>

      {/* Back */}
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500,
          marginBottom: 20, transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)')}
      >
        <ChevronLeft style={{ width: 18, height: 18 }} />
        Kembali
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

        {/* Main */}
        <div>
          {/* Player */}
          <div style={{
            aspectRatio: '16/9',
            background: '#000',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            position: 'relative',
          }}>
            {/* Red top accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#E50914', zIndex: 5 }} />

            {isSecureUrl ? (
              isIframeUrl ? (
                <iframe
                  src={video.video_url}
                  allowFullScreen
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                />
              ) : (
                <video
                  ref={videoRef}
                  src={video.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#1a1a1a',
                fontFamily: 'Inter, sans-serif', color: '#E50914', fontSize: '0.9rem',
              }}>
                Error: Sumber video tidak valid
              </div>
            )}
          </div>
          {/* ADS BANNER */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px',
              marginBottom: '20px',
              minHeight: '90px'
            }}
          >
            <div id="container-00b0c9d96d5d83fb01b522176a74cd79"
              style={{
                width: '100%',
                maxWidth: '280px'
              }}></div>
          </div>

          {/* Info */}
          <div style={{ marginTop: 20, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h1 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              margin: '0 0 16px 0',
            }}>
              {video.title}
            </h1>

            {/* Author + actions row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E50914, #7b0008)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Play style={{ width: 16, height: 16, fill: '#fff', color: '#fff', marginLeft: 2 }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff', margin: 0 }}>
                    {video && getChannelName(video.id)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap mt-4 sm:mt-0">
                <button style={{
                  padding: '7px 18px',
                  background: '#fff', color: '#141414',
                  borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 700,
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#ddd')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#fff')}
                >
                  Subscribe
                </button>
                <button
                  onClick={handleLike}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 20,
                    background: liked ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.08)',
                    border: liked ? '1px solid rgba(229,9,20,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    color: liked ? '#E50914' : 'rgba(255,255,255,0.7)',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <ThumbsUp style={{ width: 15, height: 15, fill: liked ? '#E50914' : 'none' }} />
                  {formatViews(likes)}
                </button>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
                >
                  <Eye style={{ width: 15, height: 15 }} />
                  {formatViews(views)} views
                </button>
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)')}
                >
                  <Share2 style={{ width: 15, height: 15 }} />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{
            marginTop: 20,
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            borderLeft: '3px solid #E50914',
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0,
            }}>
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>FreePlay</strong> · Update Setiap Hari
              <br /><br />
              Nikmati pengalaman streaming terbaik di FreePlay — gratis, tanpa batas.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700,
            color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 3, height: 18, background: '#E50914', borderRadius: 2, display: 'inline-block' }} />
            Video Terkait
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.map((v) => (
              <motion.div key={v.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
                <Link
                  to={`/video/${v.id}`}
                  style={{ display: 'flex', gap: 10, textDecoration: 'none', borderRadius: 6, overflow: 'hidden' }}
                  className="group"
                >
                  <div style={{
                    flex: '0 0 130px', aspectRatio: '16/9',
                    borderRadius: 4, overflow: 'hidden', background: '#1a1a1a', position: 'relative',
                  }}>
                    <video
                      src={`${v.video_url}#t=0.5`}
                      preload="metadata"
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0)',
                      transition: 'background 0.2s',
                    }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
                      color: '#ccc', lineHeight: 1.4, margin: '0 0 6px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                    }}>
                      {v.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.35)', margin: 0,
                    }}>
                     FreePlay · {formatViews(getStoredViews(v.id))} views
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
