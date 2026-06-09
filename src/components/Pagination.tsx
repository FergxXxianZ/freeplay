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
    const items = [];

    const addPage = (page: number) => {
      const isActive = currentPage === page;

        items.push(
          <Link
            key={page}
            to={getPageUrl(page)}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: isActive ? 700 : 400,
              background: isActive ? '#E50914' : 'rgba(255,255,255,0.06)',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          >
            {page}
          </Link>
    );
  };

  const addDots = (key: string) => {
    items.push(
      <span
        key={key}
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)',
        }}
      >
        ...
      </span>
    );
  };

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      addPage(i);
    }
  } else {
    addPage(1);

    if (currentPage <= 4) {
      addPage(2);
      addPage(3);
      addPage(4);
      addDots('start');
      addPage(totalPages);
    } else if (currentPage >= totalPages - 3) {
      addDots('end');
      addPage(totalPages - 3);
      addPage(totalPages - 2);
      addPage(totalPages - 1);
      addPage(totalPages);
    } else {
      addDots('left');
      addPage(currentPage - 1);
      addPage(currentPage);
      addPage(currentPage + 1);
      addDots('right');
      addPage(totalPages);
    }
  }

  return items;
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
