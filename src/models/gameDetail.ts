import Game from "./game";
import Metacriticplatform from "./metacriticplatform";

export default interface GameDetail extends Game {
  name_original: string;
  description: string;
  description_raw: string;
  metacritic_platforms: Metacriticplatform[];
  background_image_additional: string;
  website: string;
  ratings: object;
  reactions: object;
  added_by_status: object;
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: string;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: string;
  youtube_count: string;
  alternative_names: string[];
  metacritic_url: string;
  parents_count: number;
  additions_count: number;
  game_series_count: number;
}
