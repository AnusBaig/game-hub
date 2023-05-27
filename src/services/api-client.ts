import axios from "axios";

export default axios.create({
    baseURL: 'https://api.rawg.io/api/',
    params: {
        key: 'dc5df7919f524e57938609551e246696'
    }
});