import EsrbRating from "./esrbRating";
import Requirements from "./requirements";

export default interface Platform {
    platform: EsrbRating;
    requirements: Requirements;
    released_at: string;
}
