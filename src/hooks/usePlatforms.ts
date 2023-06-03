import { Endpoints } from "../constants/endpoints";
import Platform from "../models/platform";
import useData from "./useData";

const usePlatforms = () => useData<Platform>(Endpoints.FETCH_PARENT_PLATFORMS);

export default usePlatforms;
