/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}
