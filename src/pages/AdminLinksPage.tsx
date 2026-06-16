import React, { useState } from 'react';
import { VideoLinkManager } from '../components/VideoLinkManager';
import { CheckerPage } from '../components/CheckerPage';
import { Link2, Search } from 'lucide-react';

/**
 * Admin page untuk mengelola link video dan checker
 * Route: /admin/links
 */
export const AdminLinksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manager' | 'checker'>('manager');

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4">
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              activeTab === 'manager'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Link2 className="w-5 h-5" />
            Link Manager
          </button>
          <button
            onClick={() => setActiveTab('checker')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
              activeTab === 'checker'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Search className="w-5 h-5" />
            Link Checker
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'manager' && <VideoLinkManager />}
      {activeTab === 'checker' && <CheckerPage />}
    </div>
  );
};
