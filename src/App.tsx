import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { VideoPage } from './pages/VideoPage';
import { UploadPage } from './pages/UploadPage';
import { Play } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#141414', color: '#e5e5e5', fontFamily: 'Inter, sans-serif' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/page/:pageNumber" element={<HomePage />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{
          background: '#0d0d0d',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '48px 32px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(to right, transparent, #E50914 30%, #E50914 70%, transparent)',
            opacity: 0.5,
          }} />

          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
              <div style={{
                background: '#E50914', padding: '5px 6px', borderRadius: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Play style={{ width: 14, height: 14, fill: '#fff', color: '#fff' }} />
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 800,
                fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#E50914',
              }}>
                FREEPLAY
              </span>
            </div>

            {/* Links grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: 32,
            }}>
              {[
                'FAQ', 'Help Center', 'Account', 'Media Center',
                'Investor Relations', 'Jobs', 'Cookie Preferences',
                'Privacy', 'Terms of Use', 'Contact Us',
              ].map((label) => (
                <a
                  key={label}
                  href="#"
                  style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)')}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* Bottom row */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.2)', margin: 0,
              }}>
                © 2026 FreePlay. All rights reserved. Content sourced from Videy.co
              </p>
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 3,
                fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.3)',
              }}>
                🌐 Indonesia
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
