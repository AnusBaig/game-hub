import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import { CacheKeys } from "../../constants/cacheKeys";
import { Endpoints } from "../../constants/endpoints";
import queryConfig from "../../models/config/queryConfig";
import HookResponse from "../../models/responses/hookResponse";
import ApiClient from "../../services/apiClient";

const useData = <T>(
  endpoint: Endpoints,
  key: CacheKeys,
  routeParams?: { [key: string]: string },
  requestparams?: object,
  queryConfig?: queryConfig,
  deps?: any[]
): HookResponse<T> => {
  let url = endpoint.toString();

  for (let key in routeParams) {
    if (routeParams.hasOwnProperty(key)) {
      const placeholder = `:${key}`;
      const value = routeParams[key];

      url = url.replace(placeholder, value);
    }
  }

  var client = new ApiClient<T>(url);

  const { data, error, isLoading } = useQuery<T, Error>({
    queryKey: [key, ...(deps || [])],
    queryFn: () => client.get(requestparams),
    staleTime: ms("2m"),
    retry: 4,
    keepPreviousData: true,
    ...queryConfig,
  });

  return {
    data,
    error: error?.message || null,
    isLoading,
  };
};

export default useData;
