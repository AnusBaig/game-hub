import Platform from "../models/platform";
import HookResponse from "../models/responses/hookResponse";
import usePlatforms from "./usePlatforms";

const usePlatform = (id?: number): HookResponse<Platform> => {
  const { data, error, isLoading } = usePlatforms();
  const platform = data?.find((platform) => platform.id === id);

  return { data: platform, error, isLoading };
};

export default usePlatform;
