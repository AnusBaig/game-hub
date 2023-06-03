import platforms from "../data/platforms";
import Platform from "../models/platform";
import HookResponse from "../models/responses/hookResponse";

const usePlatforms = (): HookResponse<Platform[]> => {
  return {
    data: platforms,
    isLoading: false,
    error: platforms && platforms.length > 0 ? null : "No platform available",
  };
};

export default usePlatforms;
