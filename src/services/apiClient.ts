import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.rawg.io/api/",
  params: {
    key: "dc5df7919f524e57938609551e246696",
  },
});

export default class ApiClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = (params?: object) =>
    axiosInstance.get<T>(this.endpoint, { params }).then((res) => res.data);

  get = () => axiosInstance.get<T>(this.endpoint).then((res) => res.data);

  post = (payload: T) =>
    axiosInstance.post<T>(this.endpoint, payload).then((res) => res.data);
}
