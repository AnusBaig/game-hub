import Genre from "../genre";
import Platform from "../platform";

export default interface GameQuery {
  genreId?: number;
  platformId?: number;
  sortOrder: string;
  search?: string;
  page: number;
  pageSize: number;
  // Advanced filtering options
  metacriticMin?: number;
  metacriticMax?: number;
  releasedAfter?: string;
  releasedBefore?: string;
  tags?: string[];
  publishers?: string[];
  developers?: string[];
  esrbRating?: string;
  platforms?: number[];
  // Cache invalidation helper
  searchTimestamp?: number;
}
