import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-500 transition-colors">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-white uppercase">FreePlay</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="Search videos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              />
            </div>
          </form>

          <div className="hidden sm:flex items-center gap-4">
            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Browse</button>
            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Trending</button>
          </div>
        </div>
      </div>
    </nav>
  );
};
