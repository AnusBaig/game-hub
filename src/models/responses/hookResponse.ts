export default interface HookResponse<T> {
  data?: T;
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  error: string | null;
}
