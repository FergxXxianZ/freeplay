import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, searchQuery }) => {
  const getPageUrl = (page: number) => {
    const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
    return `/page/${page}${searchParam ? `?${searchParam.slice(1)}` : ''}`;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      const isActive = currentPage === i;
      pages.push(
        <Link
          key={i}
          to={getPageUrl(i)}
          style={{
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4,
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            fontWeight: isActive ? 700 : 400,
            background: isActive ? '#E50914' : 'rgba(255,255,255,0.06)',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.2s',
            boxShadow: isActive ? '0 2px 12px rgba(229,9,20,0.4)' : 'none',
          }}
          className={cn(!isActive && 'hover:bg-white/10 hover:text-white')}
        >
          {i}
        </Link>
      );
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  const btnStyle = (disabled: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '0 14px', height: 36, borderRadius: 4,
    fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 500,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
    pointerEvents: disabled ? 'none' as const : 'auto' as const,
    opacity: disabled ? 0.4 : 1,
    textDecoration: 'none',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 48, marginBottom: 24 }}>
      <Link to={getPageUrl(Math.max(1, currentPage - 1))} style={btnStyle(currentPage === 1)}>
        <ChevronLeft style={{ width: 16, height: 16 }} />
        <span className="hidden sm:inline">Prev</span>
      </Link>

      <div style={{ display: 'flex', gap: 4 }}>
        {renderPageNumbers()}
      </div>

      <Link to={getPageUrl(Math.min(totalPages, currentPage + 1))} style={btnStyle(currentPage === totalPages)}>
        <span className="hidden sm:inline">Next</span>
        <ChevronRight style={{ width: 16, height: 16 }} />
      </Link>
    </div>
  );
};
