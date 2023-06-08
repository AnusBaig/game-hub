import Platform from "../models/platform";
import HookResponse from "../models/responses/hookResponse";
import useGenres from "./useGenres";

const useGenre = (id?: number): HookResponse<Platform> => {
  const { data, error, isLoading } = useGenres();
  const genre = data?.find((genre) => genre.id === id);

  return { data: genre, error, isLoading };
};

export default useGenre;
