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

  getAll(params?: object) {
    console.log("Fetching data from " + this.endpoint)
    var response = axiosInstance.get<T>(this.endpoint, { params }).then((res) => res.data);
    console.log("Response fetched successfully");
    console.log(response);
    return response;
  }

  get(params?: object) {
    console.log("Fetching data from " + this.endpoint)
    var response = axiosInstance.get<T>(this.endpoint, { params }).then((res) => res.data);
    console.log("Response fetched successfully");
    console.log(response);
    return response;
  }

  post = (payload: T) =>
    axiosInstance.post<T>(this.endpoint, payload).then((res) => res.data);
}
