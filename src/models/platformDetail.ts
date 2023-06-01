import Requirements from "./requirements";
import Platform from "./platform";

export default interface PlatformDetail {
    platform: Platform;
    requirements: Requirements;
    released_at: string;
}
