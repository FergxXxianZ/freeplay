export interface Video {
  id: string;
  title: string;
  video_url: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  videos: Video[];
}
