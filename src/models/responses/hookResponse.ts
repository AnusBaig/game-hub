export default interface HookResponse<T> {
  data?: T;
  isLoading: boolean;
  error: string | null;
}
