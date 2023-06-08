export default interface QueryConfig {
  keepPreviousData?: boolean;
  staleTime?: number;
  retry?: number;
  initialData?: any;
}
