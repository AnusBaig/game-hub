import { useQuery } from "@tanstack/react-query";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import queryConfig from "../models/config/queryConfig";
import HookResponse from "../models/responses/hookResponse";
import ApiClient from "../services/apiClient";
import FetchResponse from "../models/responses/fetchResponse";

const useData = <T>(
  endpoint: Endpoints,
  key: CacheKeys,
  requestparams?: object,
  queryConfig?: queryConfig
): HookResponse<T[]> => {
  var client = new ApiClient<FetchResponse<T>>(endpoint);

  const { data, error, isLoading } = useQuery<FetchResponse<T>, Error>({
    queryKey: [key],
    queryFn: () => client.getAll(requestparams),
    staleTime: 2 * 60 * 1000, // 2 min
    retry: 4,
    keepPreviousData: true,
    ...queryConfig,
  });

  return {
    data: data?.results,
    error:
      data?.results && data?.results.length > 0
        ? null
        : error?.message || "No data available",
    isLoading,
  };
};

export default useData;
