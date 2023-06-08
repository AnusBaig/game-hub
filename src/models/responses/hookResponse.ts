export default interface HookResponse<T> {
  data?: T;
  isLoading: boolean;
  isFetching?: boolean;
  error: string | null;
  fetchNextPage?: () => void;
}
