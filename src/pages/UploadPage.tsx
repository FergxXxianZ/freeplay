import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Link as LinkIcon, Type, Play, CheckCircle, AlertCircle, Loader, Trash2, ArrowLeft, Lock } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [recentUploads, setRecentUploads] = useState<{ id: string; title: string; video_url: string }[]>([]);

  // Pola URL yang diizinkan
  const ALLOWED_PATTERNS = [
    /^(?:https?:\/\/)?cdn\.videy\.co\/[a-zA-Z0-9_\-]+\.mp4$/,
    /^(?:https?:\/\/)?cdn2\.videy\.co\/[a-zA-Z0-9_\-]+\.mp4$/,
    /^(?:https?:\/\/)?(?:www\.)?videy\.co\/v\/?\?id=[a-zA-Z0-9_\-]+$/,
  ];

  const isValidUrl = (val: string) => ALLOWED_PATTERNS.some((p) => p.test(val.trim()));

  const extractVideyId = (val: string): string | null => {
    // Coba parse sebagai URL resmi menggunakan URLSearchParams
    try {
      const withScheme = val.trim().startsWith('http') ? val.trim() : `https://${val.trim()}`;
      const parsed = new URL(withScheme);
      const isVideyHost =
        parsed.hostname === 'videy.co' ||
        parsed.hostname === 'www.videy.co';
      if (isVideyHost) {
        const id = parsed.searchParams.get('id');
        if (id && id.length > 0) return id;
      }
    } catch {
      // Bukan URL valid, tidak apa-apa
    }
    return null;
  };

  // onChange: hanya update state, validasi ringan
  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (val.trim() && !isValidUrl(val)) {
      // Jangan tampilkan error saat sedang mengetik embed URL
      const looksLikeEmbed = val.toLowerCase().includes('videy.co');
      if (!looksLikeEmbed) {
        setUrlError('URL tidak valid. Gunakan format: cdn.videy.co/ID.mp4 atau videy.co/v/?id=ID');
      } else {
        setUrlError('');
      }
    } else {
      setUrlError('');
    }
  };

  // onBlur: konversi URL embed ke format CDN
  const handleUrlBlur = (val: string) => {
    const videoId = extractVideyId(val);
    if (videoId) {
      const converted = `https://cdn.videy.co/${videoId}.mp4`;
      setUrl(converted);
      setUrlError('');
    } else if (val.trim() && !isValidUrl(val)) {
      setUrlError('URL tidak valid. Gunakan format: cdn.videy.co/ID.mp4 atau videy.co/v/?id=ID');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedUrl = url.trim();

    if (!isValidUrl(cleanedUrl)) {
      setUrlError('URL tidak valid. Format yang diizinkan: cdn.videy.co/ID.mp4');
      return;
    }

    // Auto-prefix https:// jika belum ada
    let finalUrl = cleanedUrl;
    if (finalUrl.startsWith('http://')) {
      finalUrl = finalUrl.replace('http://', 'https://');
    } else if (!finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          video_url: finalUrl,
          code: accessCode.trim()
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload gagal');
      }
      const newVideo = await res.json();
      setRecentUploads((prev) => [newVideo, ...prev]);
      setStatus('success');
      setMessage(`"${newVideo.title}" berhasil ditambahkan!`);
      setTitle('');
      setUrl('');
      setAccessCode('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    setRecentUploads((prev) => prev.filter((v) => v.id !== id));
  };

  const isFormReady = title.trim() !== '' && url.trim() !== '' && accessCode.trim() !== '' && !urlError;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px 12px 44px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#fff',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div className="mx-auto px-4 sm:px-6 md:px-8 py-8 pb-20" style={{ maxWidth: 680 }}>

      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem', fontWeight: 500, marginBottom: 32, padding: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#fff')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)')}
      >
        <ArrowLeft style={{ width: 18, height: 18 }} />
        Kembali
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: '#E50914',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 800,
              color: '#fff', letterSpacing: '-0.02em', margin: 0,
            }}>
              Upload Video
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.4)', margin: '2px 0 0',
            }}>
              Tambahkan video baru ke FreePlay
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginTop: 20 }} />
      </div>

      {/* Form */}
      <div className="p-5 sm:p-7 md:p-8" style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        borderTop: '3px solid #E50914',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.7)', marginBottom: 8,
            }}>
              Judul Video
            </label>
            <div style={{ position: 'relative' }}>
              <Type style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: 'rgba(255,255,255,0.3)',
              }} />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul video..."
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229,9,20,0.6)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.7)', marginBottom: 8,
            }}>
              URL Video
            </label>
            <div style={{ position: 'relative' }}>
              <LinkIcon style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: 'rgba(255,255,255,0.3)',
              }} />
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Masukan URL disini"
                required
                style={{
                  ...inputStyle,
                  borderColor: urlError ? 'rgba(229,9,20,0.6)' : 'rgba(255,255,255,0.12)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = urlError ? 'rgba(229,9,20,0.8)' : 'rgba(229,9,20,0.6)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.1)';
                }}
                onBlur={(e) => {
                  handleUrlBlur(e.target.value);
                  e.currentTarget.style.borderColor = urlError ? 'rgba(229,9,20,0.6)' : 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {urlError ? (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#E50914', margin: 0 }}>
                  ⚠ {urlError}
                </p>
              ) : (
                <>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    💡 Format: cdn.videy.co/ID.mp4 atau link embed videy.co/v/?id=ID
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    ✅ URL embed akan otomatis dikonversi ke format CDN
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Access Code */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.7)', marginBottom: 8,
            }}>
              Access Code (Secret)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: 'rgba(255,255,255,0.3)',
              }} />
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Masukkan kode akses rahasia..."
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(229,9,20,0.6)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(229,9,20,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Status message */}
          {status !== 'idle' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 6,
              background: status === 'success' ? 'rgba(34,197,94,0.08)'
                : status === 'error' ? 'rgba(229,9,20,0.08)'
                  : 'rgba(255,255,255,0.05)',
              border: `1px solid ${status === 'success' ? 'rgba(34,197,94,0.3)'
                : status === 'error' ? 'rgba(229,9,20,0.3)'
                  : 'rgba(255,255,255,0.1)'}`,
            }}>
              {status === 'loading' && <Loader style={{ width: 16, height: 16, color: '#fff', animation: 'spin 1s linear infinite', flexShrink: 0 }} />}
              {status === 'success' && <CheckCircle style={{ width: 16, height: 16, color: '#22c55e', flexShrink: 0 }} />}
              {status === 'error' && <AlertCircle style={{ width: 16, height: 16, color: '#E50914', flexShrink: 0 }} />}
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500,
                color: status === 'success' ? '#22c55e' : status === 'error' ? '#E50914' : 'rgba(255,255,255,0.8)',
              }}>
                {status === 'loading' ? 'Menyimpan video...' : message}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading' || !isFormReady}
            style={{
              padding: '13px',
              background: (status === 'loading' || !isFormReady) ? 'rgba(229,9,20,0.3)' : '#E50914',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 700,
              cursor: (status === 'loading' || !isFormReady) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
              boxShadow: isFormReady && status !== 'loading' ? '0 4px 20px rgba(229,9,20,0.35)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (isFormReady && status !== 'loading')
                (e.currentTarget as HTMLButtonElement).style.background = '#c40812';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                (status === 'loading' || !isFormReady) ? 'rgba(229,9,20,0.3)' : '#E50914';
            }}
          >
            {status === 'loading'
              ? <><Loader style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Menyimpan...</>
              : <><Upload style={{ width: 16, height: 16 }} /> Tambahkan Video</>
            }
          </button>
        </form>
      </div>

      {/* Recent Uploads */}
      {recentUploads.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700,
            color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 3, height: 16, background: '#E50914', borderRadius: 2, display: 'inline-block' }} />
            Baru Ditambahkan ({recentUploads.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentUploads.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  borderLeft: '3px solid #E50914',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                    {v.title}
                  </p>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.3)', margin: '3px 0 0',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {v.video_url}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/video/${v.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 4,
                      background: '#fff', border: 'none', color: '#141414',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Play style={{ width: 11, height: 11, fill: '#141414' }} />
                    Play
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    style={{
                      padding: '6px 10px', borderRadius: 4,
                      background: 'rgba(229,9,20,0.1)',
                      border: '1px solid rgba(229,9,20,0.25)',
                      color: 'rgba(229,9,20,0.7)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
