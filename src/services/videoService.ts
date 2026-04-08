import { Video, PaginationData } from '../types';
import videoData from '../data/videos.json';

const VIDEOS_PER_PAGE = 20;

export const videoService = {
  getVideos: (page: number, searchQuery: string = ''): PaginationData => {
    let filteredVideos = videoData as Video[];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredVideos = filteredVideos.filter(v => 
        v.title.toLowerCase().includes(query)
      );
    }

    const totalVideos = filteredVideos.length;
    const totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    
    const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
    const endIndex = startIndex + VIDEOS_PER_PAGE;
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      videos: paginatedVideos
    };
  },

  getVideoById: (id: string): Video | undefined => {
    return (videoData as Video[]).find(v => v.id === id);
  },

  getRelatedVideos: (currentId: string, limit: number = 4): Video[] => {
    return (videoData as Video[])
      .filter(v => v.id !== currentId)
      .sort(() => 0.5 - Math.random())
      .slice(0, limit);
  }
};
