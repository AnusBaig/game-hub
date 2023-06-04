import Genre from "../genre";
import Platform from "../platform";

export default interface GameQuery {
  genre: Genre;
  platform: Platform;
  sortOrder: string;
  search: string;
}
