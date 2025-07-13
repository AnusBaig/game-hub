import axios from "axios";

const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_RAWG_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RAWG API key is not configured. Please add VITE_RAWG_API_KEY to your .env.local file."
    );
  }
  return apiKey;
};

const axiosInstance = axios.create({
  baseURL: "https://api.rawg.io/api/",
  params: {
    key: getApiKey(),
  },
});

export default class ApiClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = (params?: object) =>
    axiosInstance.get<T>(this.endpoint, { params }).then((res) => res.data);

  get = (params?: object) =>
    axiosInstance.get<T>(this.endpoint, { params }).then((res) => res.data);

  post = (payload: T) =>
    axiosInstance.post<T>(this.endpoint, payload).then((res) => res.data);
}
