import { useInfiniteQuery } from "@tanstack/react-query";
import _ from "lodash";
import ms from "ms";
import { CacheKeys } from "../constants/cacheKeys";
import { Endpoints } from "../constants/endpoints";
import queryConfig from "../models/config/queryConfig";
import FetchResponse from "../models/responses/fetchResponse";
import HookResponse from "../models/responses/hookResponse";
import ApiClient from "../services/apiClient";

const useInfiniteData = <T>(
  endpoint: Endpoints,
  key: CacheKeys,
  requestparams?: object,
  queryConfig?: queryConfig,
  deps?: any[]
): HookResponse<T[]> => {
  var client = new ApiClient<FetchResponse<T>>(endpoint);

  const {
    data,
    error,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<FetchResponse<T>, Error>({
    queryKey: [key, ...(deps || [])],
    queryFn: ({ pageParam = 1 }) =>
      client.getAll({ ...requestparams, page: pageParam }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length + 1 : undefined,
    staleTime: ms("10m"),
    retry: 4,
    keepPreviousData: true,
    ...queryConfig,
  });

  return {
    data: _.flatten(data?.pages.map((page) => page.results)),
    error:
      data?.pages && data.pages[0].count
        ? null
        : error?.message || "No data available",
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  };
};

export default useInfiniteData;
