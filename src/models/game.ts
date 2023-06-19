import EsrbRating from "./esrbRating";
import Genre from "./genre";
import Platform from "./platformDetail";
import Publisher from "./responses/publisher";

export default interface Game {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  reviews_text_count: string;
  added: number;
  metacritic: number;
  playtime: number;
  suggestions_count: number;
  updated: string;
  esrb_rating: EsrbRating;
  platforms: Platform[];
  parent_platforms: Platform[];
  genres: Genre[];
  publishers: Publisher[];
}
