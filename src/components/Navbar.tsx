import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Play, Upload, X, ChevronDown, Home, Film, Tv, TrendingUp, Menu } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Movies', path: '/?search=movie', icon: Film },
  { label: 'TV Shows', path: '/?search=show', icon: Tv },
  { label: 'New & Popular', path: '/page/1', icon: TrendingUp },
];

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

  // Kunci scroll body saat drawer terbuka
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/?search=${encodeURIComponent(query)}`);
    else navigate('/');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isUploadPage = location.pathname === '/upload';

  return (
    <>
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
          <div className="flex items-center h-[68px] gap-4 sm:gap-8">

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
                  letterSpacing: '-0.02em',
                  color: '#E50914',
                  textShadow: '0 0 20px rgba(229,9,20,0.4)',
                }}
                className="text-xl sm:text-[1.4rem]"
                >
                  FREEPLAY
                </span>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden sm:flex desktop-nav-links">
              {NAV_LINKS.map(({ label, path }) => (
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
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

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
                          width: 160,
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

              {/* Upload button */}
              <Link
                to="/upload"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
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
                className="px-2 py-[6px] sm:px-4 sm:py-[7px]"
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

              {/* Avatar — desktop only */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} className="hidden sm:flex desktop-avatar">
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

              {/* Hamburger toggle — mobile only */}
              <button
                id="hamburger-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                style={{
                  background: mobileOpen ? 'rgba(229,9,20,0.15)' : 'none',
                  border: mobileOpen ? '1px solid rgba(229,9,20,0.4)' : '1px solid transparent',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#fff',
                  padding: '6px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                className="sm:hidden"
              >
                <div style={{ position: 'relative', width: 20, height: 20 }}>
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.2s, transform 0.2s',
                    opacity: mobileOpen ? 0 : 1,
                    transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}>
                    <Menu style={{ width: 20, height: 20 }} />
                  </span>
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'opacity 0.2s, transform 0.2s',
                    opacity: mobileOpen ? 1 : 0,
                    transform: mobileOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}>
                    <X style={{ width: 20, height: 20 }} />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* === MOBILE DRAWER === */}
      {/* Backdrop overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        className="sm:hidden"
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 201,
          width: 'min(320px, 85vw)',
          background: 'linear-gradient(180deg, #141414 0%, #1a1a1a 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: mobileOpen ? '-20px 0 60px rgba(0,0,0,0.8)' : 'none',
        }}
        className="sm:hidden"
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              background: '#E50914', padding: '4px 5px', borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Play style={{ width: 13, height: 13, fill: 'white', color: 'white' }} />
            </div>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.1rem',
              letterSpacing: '-0.02em', color: '#E50914',
            }}>
              FREEPLAY
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Search bar in drawer */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <form onSubmit={handleSearch}>
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '10px 14px', gap: 10,
            }}>
              <Search style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari video..."
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem', flex: 1,
                }}
              />
            </div>
          </form>
        </div>

        {/* Nav items */}
        <div style={{ padding: '12px 12px', flex: 1, overflowY: 'auto' }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 600,
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 8, paddingLeft: 10,
          }}>
            Navigasi
          </p>
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path || location.search === path.split('?')[1]?.replace(/^/, '?');
            return (
              <button
                key={label}
                onClick={() => handleNavClick(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', textAlign: 'left',
                  padding: '12px 10px', borderRadius: 8,
                  background: isActive ? 'rgba(229,9,20,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(229,9,20,0.25)' : '1px solid transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s',
                  marginBottom: 4,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: isActive ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: 17, height: 17, color: isActive ? '#E50914' : 'rgba(255,255,255,0.5)' }} />
                </div>
                {label}
                {isActive && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#E50914', marginLeft: 'auto', flexShrink: 0,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer footer — Upload CTA */}
        <div style={{
          padding: '16px 20px 28px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={() => handleNavClick('/upload')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px',
              background: isUploadPage ? '#E50914' : 'rgba(229,9,20,0.12)',
              border: '1px solid ' + (isUploadPage ? '#E50914' : 'rgba(229,9,20,0.35)'),
              borderRadius: 8, cursor: 'pointer',
              color: '#fff', fontFamily: 'Inter, sans-serif',
              fontSize: '0.88rem', fontWeight: 700,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#E50914';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#E50914';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = isUploadPage ? '#E50914' : 'rgba(229,9,20,0.12)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = isUploadPage ? '#E50914' : 'rgba(229,9,20,0.35)';
            }}
          >
            <Upload style={{ width: 15, height: 15 }} />
            Upload Video
          </button>

          {/* User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginTop: 14, padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 6,
              background: 'linear-gradient(135deg, #E50914, #831010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.7rem', color: '#fff',
              flexShrink: 0,
            }}>
              FP
            </div>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#fff', margin: 0 }}>
                FreePlay
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Guest User
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #hamburger-btn { display: none !important; }
        }
      `}</style>
    </>
  );
};
