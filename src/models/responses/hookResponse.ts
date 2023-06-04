export default interface HookResponse<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
