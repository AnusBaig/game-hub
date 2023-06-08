import Genre from "../genre";
import Platform from "../platform";

export default interface GameQuery {
  genreId?: number;
  platformId?: number;
  sortOrder: string;
  search: string;
  page: number;
  pageSize: number;
}
