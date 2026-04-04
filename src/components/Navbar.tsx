import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Play, Upload, Menu, X, Bell, ChevronDown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query)}`);
    else navigate('/');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const isUploadPage = location.pathname === '/upload';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'background 0.4s ease',
        background: scrolled
          ? 'rgba(20,20,20,0.98)'
          : 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="mx-auto px-4 sm:px-6 md:px-8" style={{ maxWidth: 1400 }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 68, gap: 32 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: '#E50914',
                padding: '5px 6px',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Play style={{ width: 16, height: 16, fill: 'white', color: 'white' }} />
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: '1.4rem',
                letterSpacing: '-0.02em',
                color: '#E50914',
                textShadow: '0 0 20px rgba(229,9,20,0.4)',
              }}>
                FREEPLAY
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden sm:flex">
            {[
              { label: 'Home', path: '/' },
              { label: 'Movies', path: '/?search=movie' },
              { label: 'TV Shows', path: '/?search=show' },
              { label: 'New & Popular', path: '/page/1' },
            ].map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: location.pathname === path ? '#fff' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  borderRadius: 4,
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = location.pathname === path ? '#fff' : 'rgba(255,255,255,0.65)')}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              {searchOpen ? (
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.75)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    padding: '6px 12px',
                    gap: 8,
                  }}>
                    <Search style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Judul, genre..."
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.85rem',
                        width: 200,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 0, lineHeight: 1 }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 8, lineHeight: 1 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#fff')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')}
                >
                  <Search style={{ width: 20, height: 20 }} />
                </button>
              )}
            </div>

            {/* Bell */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 8, lineHeight: 1 }}
              className="hidden sm:block"
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#fff')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)')}
            >
              <Bell style={{ width: 20, height: 20 }} />
            </button>

            {/* Upload button */}
            <Link
              to="/upload"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                background: isUploadPage ? '#E50914' : 'transparent',
                border: '1px solid ' + (isUploadPage ? '#E50914' : 'rgba(255,255,255,0.3)'),
                borderRadius: 4,
                color: isUploadPage ? '#fff' : 'rgba(255,255,255,0.8)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isUploadPage) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(229,9,20,0.15)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(229,9,20,0.7)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUploadPage) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.3)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.8)';
                }
              }}
            >
              <Upload style={{ width: 14, height: 14 }} />
              <span className="hidden sm:inline">Upload</span>
            </Link>

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} className="hidden sm:flex">
              <div style={{
                width: 32, height: 32, borderRadius: 4,
                background: 'linear-gradient(135deg, #E50914, #831010)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#fff',
              }}>
                FP
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.6)' }} />
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 8 }}
              className="sm:hidden"
            >
              {mobileOpen ? <X style={{ width: 20, height: 20 }} /> : <Menu style={{ width: 20, height: 20 }} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 0 16px',
            background: 'rgba(20,20,20,0.98)',
          }}>
            <form onSubmit={handleSearch} style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#222', border: '1px solid #444',
                borderRadius: 4, padding: '8px 12px', gap: 8,
              }}>
                <Search style={{ width: 16, height: 16, color: '#888' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari video..."
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', flex: 1,
                  }}
                />
              </div>
            </form>
            {['Home', 'Movies', 'TV Shows', 'New & Popular'].map((label) => (
              <button
                key={label}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 4px', background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
